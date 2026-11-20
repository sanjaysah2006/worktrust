# WorkTrust — Demonstration Video Script

A suggested script for a ~8–10 minute demonstration video. Adjust timing to
your assignment's requirements. Record your screen with narration; no
editing effects are required — a single continuous take is fine.

**Before recording:**
- Have three browser profiles (or windows) ready and already logged in:
  Client, Freelancer, and Administrator (see `README.md` →
  Demonstration accounts).
- Have MetaMask unlocked in each, connected to Sepolia, with some test ETH.
- Have the freelancer's wallet address already saved on their Profile page.
- Close unrelated browser tabs and notifications so the recording is clean.

---

### 1. Introduction (0:00–0:45)

> "Hi, I'm [name], and this is WorkTrust — a freelance marketplace where job
> payments are held in an Ethereum smart contract escrow instead of a
> middleman. Clients post jobs, freelancers apply and get hired, and the
> payment sits in a smart contract until the client approves the delivered
> work. If something goes wrong, either side can raise a dispute, and an
> administrator steps in to resolve it. Everything you'll see uses Sepolia
> test ETH — no real money is involved."

Show the Home page briefly.

### 2. Architecture overview (0:45–1:45)

> "The frontend is React with Vite and Bootstrap. All application data —
> users, jobs, applications, hires, submissions, and disputes — lives in
> Supabase, a managed Postgres database with row-level security enforcing
> who can see and change what. The actual escrow logic lives in a Solidity
> smart contract deployed on Sepolia, which I compiled, tested, and
> deployed using Remix IDE. The frontend talks to that contract through
> Ethers.js and the user's own MetaMask wallet — I never touch anyone's
> private key or seed phrase."

Optionally show `contracts/EscrowManager.sol` and the deployed address on
Sepolia Etherscan for a few seconds.

### 3. Posting a job (Client) (1:45–2:45)

- Log in as the **Client**.
- Dashboard → **Post a New Job**.
- Fill in a title, description, and a budget in ETH (use a small amount,
  e.g. `0.01`).
- Submit, and show the job now listed on the client's dashboard with status
  "open."

> "The client posts a job with a budget in ETH. This is stored in Supabase
> — no blockchain transaction happens yet, since no money is moving."

### 4. Applying and hiring (Freelancer + Client) (2:45–4:15)

- Switch to the **Freelancer** profile/window.
- Browse Jobs → open the job just posted → Apply, with a short cover letter
  and a proposed amount.
- Switch back to the **Client** → Dashboard → View Applications → show the
  application → click **Hire**.

> "Hiring rejects every other pending applicant automatically and creates
> a 'hire' record — this is where the connection between the marketplace
> data and the blockchain escrow begins."

- Show that hiring redirects straight to the Escrow page.

### 5. Funding the escrow (Client + MetaMask) (4:15–5:45)

- On the Escrow page, click **Connect Wallet** if not already connected.
- If prompted, click **Switch to Sepolia**.
- Click **Fund Escrow**.
- Show the MetaMask popup, confirm it.
- Show the **pending** state, then the **success** state once mined.
- Click the Etherscan link to show the real transaction on Sepolia.

> "This is a real transaction — MetaMask asks me to confirm sending
> Sepolia test ETH, the app shows a pending state while it's mining, and
> once confirmed, both the smart contract and the WorkTrust database agree
> the escrow is funded. Notice the database is only updated after the
> transaction is confirmed on-chain — not before."

### 6. Submitting and approving work (5:45–7:15)

- Switch to the **Freelancer** → open the hire's Escrow page → **Submit
  Work** → fill in a message, a project URL, and a GitHub URL → submit.
- Switch to the **Client** → **Review Submission** → show the links are
  clickable → click **Approve & Release**.
- Confirm in MetaMask, show pending → success.
- Point out the freelancer's Sepolia balance increased.

> "Approving the work sends another real transaction that calls the
> contract's releasePayment function, sending the escrowed ETH directly to
> the freelancer's wallet. I'll switch over and show their balance went up
> by exactly the escrow amount."

### 7. Raising and resolving a dispute (7:15–9:00)

- Quickly repeat steps 3–5 for a second job/hire so you have a second
  funded escrow (you can speed through this part or say "I've already set
  this up the same way").
- As the **Freelancer** (or Client), open that hire's Escrow page → **Raise
  a Dispute** → give a reason → confirm in MetaMask.
- Switch to the **Administrator** → **Disputes** in the navbar → open the
  dispute → show the job, both parties, and the reason.
- Click **Release to Freelancer** (or **Refund Client**) → confirm the
  prompt → confirm in MetaMask → show the resolved state.

> "If either party isn't satisfied, they can raise a dispute — this locks
> the funds on-chain immediately. An administrator — and only the exact
> wallet address that deployed the contract — can then review the case and
> decide to release the funds or refund the client."

### 8. Transaction history and wrap-up (9:00–10:00)

- Visit `/transactions` as any user, show the full history with Etherscan
  links.
- Briefly mention the wrong-network and wallet-disconnected states if not
  already shown naturally.

> "Every transaction — funding, releasing, disputing, and resolving — is
> logged with its hash and status, and links straight to Sepolia Etherscan
> for anyone to verify independently. That's WorkTrust: a complete
> freelance hiring workflow with the actual payment custody handled by a
> transparent, auditable smart contract instead of a trusted middleman.
> Thanks for watching."

---

### Optional B-roll / cutaway shots (if time allows)
- The Remix IDE showing the contract compiled and the unit tests passing.
- The Supabase table editor showing a `hires` row with its `escrow_status`
  and `escrow_id` filled in.
- Etherscan showing the contract's verified source code (if you verified
  it).
