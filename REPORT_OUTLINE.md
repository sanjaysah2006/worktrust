# WorkTrust — Academic Project Report Outline

This outline is a suggested structure for a written report accompanying the
WorkTrust project. Section lengths are suggestions — adjust to your course's
requirements. Where useful, pull directly from `README.md`,
`PHASE5_GUIDE.md`, and `PHASE6_GUIDE.md` rather than rewriting from scratch.

## 1. Title Page
- Project title, your name/student ID, course name and code, institution,
  submission date, supervisor's name (if applicable).

## 2. Abstract (150–250 words)
- One paragraph summarizing the problem (trust in freelance payments),
  the approach (blockchain escrow + a conventional web app), and the outcome
  (a working end-to-end demo on a public testnet).

## 3. Introduction
- 3.1 Background and motivation — why freelance marketplaces have a
  trust/payment problem (non-payment, disputes with no neutral arbiter,
  platform fees).
- 3.2 Problem statement — what specifically WorkTrust solves.
- 3.3 Objectives — a bullet list matching the required workflow (post job,
  apply, hire, fund escrow, submit work, approve/release, dispute, admin
  resolution).
- 3.4 Scope and limitations — see the "Known limitations" section of
  `README.md`; state clearly what the project does *not* attempt (real
  payments, mainnet deployment, mobile apps, notifications, etc.).

## 4. Literature / Technology Review
- 4.1 Why a smart contract escrow instead of a trusted third party —
  briefly explain the trust-minimization argument.
- 4.2 Comparable systems — traditional freelance platforms (fee-based
  trust) vs. blockchain escrow (code-based trust); note this doesn't need
  to be exhaustive, a short comparison is enough.
- 4.3 Technology choices and justification:
  - React + Vite — component-based UI, fast dev server.
  - Supabase — managed Postgres + Auth + Row Level Security without
    running a custom backend server.
  - Solidity + Remix — no local toolchain (Hardhat/Foundry) required,
    suited to a testnet-only academic deployment.
  - Ethers.js v6 + MetaMask — the standard way to bridge a browser dApp to
    a user's wallet.
  - Sepolia testnet — free, safe environment for testing real transaction
    mechanics without financial risk.

## 5. System Design
- 5.1 Actors and roles — Client, Freelancer, Administrator; what each can
  and cannot do (this maps directly to the RLS policies and
  `ProtectedRoute` role checks in the code).
- 5.2 High-level architecture diagram — three boxes: React frontend ↔
  Supabase (Postgres/Auth) and React frontend ↔ MetaMask ↔ Sepolia
  (EscrowManager contract). Note the frontend never talks to the two
  backends' data directly — Supabase enforces access via RLS, and the
  chain enforces access via `require()` statements in Solidity.
- 5.3 Database schema — list the seven tables (`profiles`, `jobs`,
  `applications`, `hires`, `submissions`, `disputes`,
  `blockchain_transactions`) with a short description of each and their
  relationships (see `supabase/phase2_migration.sql` for the full DDL and
  comments).
- 5.4 Smart contract design — the `Escrow` struct, the four-state
  lifecycle (Funded → Released, or Funded → Disputed → Released/Refunded),
  and the four external functions. Reference `contracts/EscrowManager.sol`.
- 5.5 Sequence diagrams — draw at least two: (a) the happy path (post job →
  apply → hire → fund → submit → approve → release), and (b) the dispute
  path (fund → submit or not → dispute → admin resolves).

## 6. Implementation
- 6.1 Frontend structure — routing table (every path in `App.jsx`),
  component/page breakdown, state management approach (React Context for
  auth and wallet state, local `useState`/`useEffect` per page — no Redux).
- 6.2 Database layer — how Row Level Security replaces a traditional
  backend's authorization logic; give one or two concrete policy examples
  (e.g. only the client or freelancer on a hire can read its disputes).
- 6.3 Smart contract implementation — walk through `createEscrow`,
  `releasePayment`, `raiseDispute`, `resolveDispute`; highlight the
  checks-effects-interactions pattern and the custom reentrancy guard.
- 6.4 Blockchain integration layer — explain `src/lib/blockchain.js` as the
  single point of contact with Ethers.js, and the "confirm on-chain first,
  then write to the database" pattern used throughout (Phase 5/6 guides
  describe this in detail with the exact pending → confirmed/failed flow).
- 6.5 A real engineering problem you solved — the UUID-to-`uint256`
  conversion needed because Postgres job IDs are UUIDs but Solidity's
  `jobId` parameter is numeric (`jobIdToUint256`/`uint256ToJobId` in
  `blockchain.js`). This is a good concrete example to include, as it
  shows independent problem-solving beyond following a tutorial.

## 7. Security Considerations
- 7.1 Smart contract security — reentrancy protection, checks-effects-
  interactions, access control per function, rejection of zero-value/zero-
  address input, protection against double-release/double-refund. Point to
  the contract's own inline comments as evidence.
- 7.2 Application security — Row Level Security as defense-in-depth beyond
  the UI's own role checks; the database trigger that blocks users from
  granting themselves the admin role through the app.
- 7.3 Wallet safety — the app never requests a seed phrase or private key;
  wallet-mismatch checks warn users before they send a transaction that
  the contract would reject anyway (wasting gas).
- 7.4 Trust boundaries — what the database enforces vs. what only the
  smart contract enforces, and why both layers exist (the database can be
  wrong or lag; the chain is the final source of truth for fund custody).

## 8. Testing
- 8.1 Smart contract unit testing — describe the Remix Solidity Unit
  Testing suite (`contracts/tests/EscrowManager_test.sol`); note the
  "Actor" contract pattern used to simulate distinct wallets, and why it
  was necessary.
- 8.2 Manual application testing — summarize your run through the
  Testing Checklist in `README.md`; screenshot or table the key results.
- 8.3 Known issues found and fixed during development — a short table is
  effective here, e.g.:

  | Issue | Where | Fix |
  |---|---|---|
  | Navbar's mobile menu didn't open | `main.jsx` was missing the Bootstrap JS bundle import | Added `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` |
  | Contract reads could silently target the wrong network | `getReadOnlyContract()` used MetaMask's current network | Switched read-only calls to a dedicated Sepolia RPC provider |
  | Admin dashboard claimed a feature didn't exist | Stale placeholder text in `App.jsx` | Replaced with a real link to the disputes page |

  (Add to this table with any additional issues you find during your own
  testing pass.)

## 9. Results and Discussion
- Demonstrate (with screenshots) a completed end-to-end run: job → hire →
  fund → submit → approve → release, and separately, a dispute → admin
  resolution run.
- Discuss gas costs observed on Sepolia for each transaction type (fund,
  release, dispute, resolve) — pull actual numbers from Etherscan.
- Discuss what worked well and what you would change with more time.

## 10. Conclusion
- Restate the objectives from Section 3.3 and confirm which were met.
- Reflect on what the project demonstrates about blockchain's suitability
  (or unsuitability) for this kind of trust problem.

## 11. Future Work
- Multisig or DAO-based dispute resolution instead of a single admin key.
- Partial releases / milestone-based payments.
- On-chain deadlines with automatic refund if a client goes unresponsive.
- Push/email notifications for status changes.
- Mainnet or Layer-2 deployment considerations (gas costs, real fund risk).

## 12. References
- Solidity documentation, Ethers.js v6 documentation, Supabase
  documentation, OpenZeppelin's reentrancy-guard pattern (referenced
  conceptually even though this project implements its own minimal
  version), and any academic papers on blockchain-based marketplaces you
  cite in your literature review.

## Appendices
- A. Full database schema (`supabase/phase2_migration.sql`,
  `phase5_migration.sql`, `phase6_migration.sql`).
- B. Full smart contract source (`contracts/EscrowManager.sol`).
- C. Contract ABI (`src/lib/blockchain.js`, `CONTRACT_ABI` constant).
- D. Testing checklist results (from `README.md`).
