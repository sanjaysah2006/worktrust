# WorkTrust

WorkTrust is a freelance marketplace where job payments are held in an
Ethereum smart contract escrow instead of a middleman. A client posts a job,
hires a freelancer, and funds the agreed amount in Sepolia test ETH. The
contract holds the funds until the client approves the delivered work — at
which point the contract releases payment automatically — or until a dispute
is raised and an administrator resolves it.

This is an academic/demonstration project. It uses **Sepolia testnet ETH**
only — no real cryptocurrency is ever used or requested.

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [How it works](#how-it-works)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment variables](#environment-variables)
7. [Supabase setup](#supabase-setup)
8. [Smart contract: compiling, testing, and deploying with Remix](#smart-contract-compiling-testing-and-deploying-with-remix)
9. [Running the app locally](#running-the-app-locally)
10. [Deploying to Vercel](#deploying-to-vercel)
11. [Demonstration accounts](#demonstration-accounts)
12. [Testing checklist](#testing-checklist)
13. [Known limitations](#known-limitations)
14. [Further documentation](#further-documentation)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, JavaScript only (no TypeScript) |
| Styling | Bootstrap 5 |
| Routing | React Router v6 |
| Backend / database | Supabase (Postgres, Auth, Row Level Security) |
| Smart contract | Solidity, compiled/tested/deployed via Remix IDE |
| Blockchain client | Ethers.js v6, MetaMask (`BrowserProvider`) |
| Network | Ethereum Sepolia testnet |
| Hosting | Vercel |

No Next.js, no custom Node.js backend, no Hardhat, no Docker, no Redux, and
no real cryptocurrency are used anywhere in this project.

## Project structure

```
worktrust/
├── contracts/
│   ├── EscrowManager.sol          # the deployed escrow smart contract
│   └── tests/
│       └── EscrowManager_test.sol # Remix Solidity Unit Testing suite
├── supabase/
│   ├── phase2_migration.sql       # core tables, RLS policies (run first)
│   ├── phase5_migration.sql       # escrow funding support (run second)
│   └── phase6_migration.sql       # submissions/disputes support (run third)
├── src/
│   ├── components/                # Navbar, ProtectedRoute, WalletButton, etc.
│   ├── context/                   # AuthContext, WalletContext
│   ├── lib/                       # Supabase queries + all Ethers.js/MetaMask logic
│   └── pages/                     # one file per route
├── PHASE5_GUIDE.md                # escrow-funding integration notes
├── PHASE6_GUIDE.md                # submissions/dispute workflow notes
├── REPORT_OUTLINE.md              # academic report outline
├── VIDEO_SCRIPT.md                # demonstration video script
└── README.md                      # this file
```

## How it works

1. **Client** registers, posts a job with a description and a budget in ETH.
2. **Freelancer** registers, browses open jobs, and applies with a cover
   letter and proposed amount.
3. **Client** reviews applications and hires one freelancer.
4. **Client** connects MetaMask and funds a smart-contract escrow with
   Sepolia test ETH for the agreed amount.
5. **Freelancer** submits completed work: a message, a project URL, and a
   GitHub URL.
6. **Client** reviews the submission and either asks for changes, or
   approves it through MetaMask — this calls the contract's
   `releasePayment`, sending the ETH to the freelancer.
7. **Either party** can raise a dispute on a funded escrow through MetaMask
   (calls `raiseDispute`), which locks the funds.
8. **Administrator** reviews open disputes and resolves each one through
   MetaMask by either releasing the funds to the freelancer or refunding the
   client (calls `resolveDispute`).
9. Every transaction hash and its final status (`pending` / `confirmed` /
   `failed`) is logged in Supabase and linked to Sepolia Etherscan.

Every action that moves money follows the same rule throughout the app:
**the database is only updated after the blockchain transaction is
confirmed** — never before, and never on a rejected or failed transaction.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer, and npm
- A free [Supabase](https://supabase.com) account/project
- The [MetaMask](https://metamask.io) browser extension
- Some free Sepolia test ETH (see [Supabase setup](#supabase-setup) → wallets,
  or jump straight to a faucet like https://sepoliafaucet.com)
- A [Vercel](https://vercel.com) account, only if you plan to deploy the
  frontend publicly

## Installation

```bash
git clone <your-repository-url>
cd worktrust
npm install
```

This installs React, Vite, Bootstrap, React Router, `@supabase/supabase-js`,
and `ethers`. Nothing else needs to be installed globally.

## Environment variables

Copy the example file and fill in your own Supabase project's values:

```bash
cp .env.example .env
```

`.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You'll find both values in your Supabase project under **Settings → API**.
`.env` is already listed in `.gitignore` — never commit it.

The smart contract's address and ABI are **not** secret (they're public on
Etherscan) and are hardcoded in `src/lib/blockchain.js`, so no environment
variable is needed for them.

## Supabase setup

1. Create a new project at https://supabase.com/dashboard.
2. Go to **SQL Editor → New query**, and run the three migration files **in
   this exact order** (each one depends on the previous one):
   1. `supabase/phase2_migration.sql` — creates every table (`profiles`,
      `jobs`, `applications`, `hires`, `submissions`, `disputes`,
      `blockchain_transactions`), all indexes, the auto-create-profile
      trigger, and every Row Level Security policy.
   2. `supabase/phase5_migration.sql` — adds `hires.escrow_id`, a uniqueness
      constraint needed for clean data embedding, and widens the money
      columns to 8 decimal places (ETH amounts need more precision than
      2 decimal places).
   3. `supabase/phase6_migration.sql` — adds `submissions.github_url` and
      allows `'dispute'` as a `blockchain_transactions.tx_type`.
   Each file is safe to re-run if needed.
3. Go to **Settings → API** and copy your Project URL and anon public key
   into `.env` (see above).
4. Go to **Authentication → Providers** and make sure **Email** is enabled.
   Whether "Confirm email" is turned on or off is up to you — the app
   handles both (see `src/pages/Register.jsx`).
5. That's it — no manual table creation, no manual RLS setup. Everything
   else (roles, permissions, triggers) is created by the SQL files above.

### How registration and roles work

- Anyone can register as a **Client** or a **Freelancer** from the app's
  Register page. A Postgres trigger automatically creates their `profiles`
  row with the role they picked.
- **Nobody can register as an Administrator from the app.** This is
  intentional — see [Demonstration accounts](#demonstration-accounts) below
  for the safe way to create one.

## Smart contract: compiling, testing, and deploying with Remix

The contract is already deployed to Sepolia at
`0xC3B5530C51AD7D50D52f855dE14dA2684F2d38d5` (already wired into
`src/lib/blockchain.js`), so **you do not need to redeploy it** to run the
app. These steps are for compiling/testing it yourself, or deploying your
own copy.

1. Open https://remix.ethereum.org in your browser.
2. In the file explorer, recreate this structure and paste in the matching
   files from this repository:
   ```
   contracts/EscrowManager.sol
   contracts/tests/EscrowManager_test.sol
   ```
3. Open the **Solidity Compiler** tab, select a `0.8.19`-or-newer compiler
   version, and click **Compile EscrowManager.sol**.
4. Open the **Solidity Unit Testing** plugin (enable it first via **Plugin
   Manager** if you don't see it), tick `EscrowManager_test.sol`, and click
   **Run**. All tests should pass — they cover deposits, access control on
   release/dispute/resolve, and double-release/double-resolve protection.
5. To deploy your own copy: open **Deploy & Run Transactions**, set
   **Environment** to **Injected Provider – MetaMask**, make sure MetaMask
   is switched to **Sepolia**, and click **Deploy**. Confirm the gas fee in
   MetaMask (paid in Sepolia test ETH).
6. Copy the deployed address, then update `CONTRACT_ADDRESS` in
   `src/lib/blockchain.js` to point at your own deployment. The ABI in that
   file already matches the contract exactly, so you don't need to change
   anything else.

## Running the app locally

```bash
npm run dev
```

Open the printed local URL (typically http://localhost:5173). Register a
Client account and a Freelancer account (see
[Demonstration accounts](#demonstration-accounts)), install MetaMask if you
haven't, and get some free Sepolia ETH from a faucet such as
https://sepoliafaucet.com before trying to fund an escrow.

To build a production bundle: `npm run build` (output goes to `dist/`). To
preview that production build locally: `npm run preview`.

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Go to https://vercel.com/new and import the repository.
3. Vercel auto-detects Vite. Confirm these build settings (they should be
   filled in automatically):
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Under **Environment Variables**, add the same two variables from your
   `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel gives you a live `https://your-project.vercel.app`
   URL once the build finishes.
6. Every subsequent push to your main branch redeploys automatically.

No server-side environment variables or serverless functions are needed —
this is a fully static frontend that talks directly to Supabase and to
Sepolia through the visitor's own MetaMask wallet.

## Demonstration accounts

For grading/demonstration purposes, create your own accounts locally rather
than relying on shared credentials (none are published in this
repository, and none should ever be committed to it):

1. **Create a Client account:** open the app → Register → fill in a name,
   email, and password → select **Client**.
2. **Create a Freelancer account:** repeat in a different browser, a
   different browser profile, or an incognito window (MetaMask connections
   are per-browser-profile, so using two separate profiles makes testing
   the full escrow flow much easier).
3. **Create an Administrator account:** there is no signup option for this
   role by design — an admin can only be created directly in the database:
   1. Register a third account normally as a Client or Freelancer.
   2. In the Supabase dashboard, go to **SQL Editor** and run:
      ```sql
      update public.profiles
      set role = 'admin'
      where email = 'the-exact-email-you-registered-with@example.com';
      ```
   3. Log out and log back in on that account — the app picks up the new
      role immediately (a database trigger blocks role changes coming from
      the app itself, so this must be done directly in SQL, as shown above).
4. **Set a wallet address for the freelancer account:** log in as the
   freelancer → **Profile** → **Connect Wallet** (top right or on the
   Profile page) → approve in MetaMask → click **Use my connected wallet**.
   A freelancer cannot be paid until this is done.
5. **Get Sepolia test ETH** for both the client and admin MetaMask accounts
   from a faucet such as https://sepoliafaucet.com or
   https://www.alchemy.com/faucets/ethereum-sepolia.

No passwords are stored anywhere in this repository or its documentation —
each grader/tester should create their own accounts using the steps above.

## Testing checklist

Use this checklist to verify the whole application end-to-end. It assumes
you've completed the [Demonstration accounts](#demonstration-accounts) setup
above (a Client, a Freelancer with a saved wallet address, and an Admin,
all with Sepolia test ETH in their connected wallets).

### Authentication & roles
- [ ] Registering as a Client creates a `profiles` row with `role = 'client'`.
- [ ] Registering as a Freelancer creates a `profiles` row with `role = 'freelancer'`.
- [ ] There is no way to register as an Administrator from the UI.
- [ ] Logging in redirects to `/dashboard`, showing the correct dashboard for the role.
- [ ] A logged-out visitor is redirected to `/login` when visiting any protected route.
- [ ] A Freelancer visiting a Client-only route (e.g. `/jobs/new`) sees "Access Denied", not a crash.
- [ ] Editing your name on `/profile` saves correctly; the Role and Email fields are read-only.

### Jobs & applications
- [ ] A Client can post a new job with title, description, and budget (ETH).
- [ ] Budget validation rejects empty, zero, or negative values.
- [ ] The job appears on `/jobs` (Browse Jobs) for a Freelancer while `status = 'open'`.
- [ ] A Freelancer can apply once with a cover letter and a proposed amount; applying twice is blocked.
- [ ] A Client can view all applications for their job and reject any of them.
- [ ] A Client can hire one applicant; every other pending applicant is auto-rejected.
- [ ] After hiring, the job's status changes and it disappears from "open" listings.

### Wallet & network handling
- [ ] Clicking **Connect Wallet** opens the MetaMask popup and, once approved, shows a shortened address.
- [ ] Switching MetaMask to a different account updates the navbar immediately, no refresh needed.
- [ ] Switching MetaMask to a network other than Sepolia shows a "Wrong network" warning with a one-click **Switch to Sepolia** button.
- [ ] Visiting any wallet-dependent page without MetaMask installed shows a clear message instead of a crash.

### Escrow funding
- [ ] A Client can fund the escrow for a new hire; MetaMask prompts for the exact agreed amount.
- [ ] The page shows a **pending** state immediately, then **success** once mined, with a working Sepolia Etherscan link.
- [ ] Rejecting the MetaMask popup shows a "rejected" state and writes nothing to the database.
- [ ] Trying to fund the same escrow twice is blocked (button disappears once funded).
- [ ] Funding fails gracefully with a clear message if the freelancer has no saved wallet address.

### Submission & approval
- [ ] A Freelancer can submit work (message, project URL, GitHub URL) once the escrow is funded.
- [ ] All three fields are validated as required, and both URLs must be well-formed.
- [ ] A Client can view the submission with clickable links.
- [ ] **Reject & Ask to Resubmit** works with no blockchain transaction and no cost.
- [ ] A Freelancer can resubmit after a rejection.
- [ ] **Approve & Release** sends a MetaMask transaction; the freelancer's Sepolia balance increases by the escrow amount once mined.
- [ ] The hire's escrow status becomes `released` only after the transaction is confirmed — never before.

### Disputes
- [ ] Either the client or the freelancer can raise a dispute on a funded escrow, with a required reason.
- [ ] Connecting the wrong wallet (not the client/freelancer address on file) disables the dispute button with an explanation.
- [ ] Raising a dispute locks the escrow (`disputed` status) after the transaction confirms.
- [ ] An Administrator sees the dispute listed under **Disputes** in the navbar.
- [ ] Connecting a wallet that is not the contract's admin address disables the resolve buttons with an explanation.
- [ ] **Release to Freelancer** and **Refund Client** each work correctly and update the dispute + hire status only after confirmation.

### Transaction states & history
- [ ] Every blockchain action correctly shows all four states at the right time: pending, success, rejected, failed.
- [ ] `/transactions` lists every transaction the logged-in user is allowed to see, each linking to Sepolia Etherscan.
- [ ] A Client/Freelancer only sees transactions for their own hires; an Admin sees all of them.

### General
- [ ] The navbar's mobile menu (hamburger icon) opens and closes correctly on a narrow screen.
- [ ] No console errors appear during a full end-to-end run of the checklist above.

## Known limitations

- There is no in-app notification system; users learn about status changes
  (a submission, a dispute, a resolution) only by visiting the app.
- A single administrator wallet (the contract's deployer address) can
  resolve every dispute. A production system would likely spread this
  responsibility across a multisig wallet or a voting mechanism.
- Escrow amounts are all-or-nothing; the contract does not support partial
  releases or refunds.
- There is no on-chain deadline/timeout — a funded escrow can remain open
  indefinitely if neither party acts.

## Further documentation

- [`PHASE5_GUIDE.md`](./PHASE5_GUIDE.md) — how the escrow-funding integration works, in detail.
- [`PHASE6_GUIDE.md`](./PHASE6_GUIDE.md) — how the submission/approval/dispute workflow works, in detail.
- [`REPORT_OUTLINE.md`](./REPORT_OUTLINE.md) — a suggested outline for an academic project report.
- [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) — a suggested script for a demonstration video.
