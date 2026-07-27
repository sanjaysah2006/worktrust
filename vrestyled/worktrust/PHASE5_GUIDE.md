# WorkTrust — Phase 5: Blockchain Escrow Integration

This phase connects your React app to the EscrowManager contract on Sepolia
using Ethers.js v6 and MetaMask.

## 1. Install the new dependency

```
cd worktrust
npm install
```

`ethers` was added to `package.json`, so `npm install` will pull it in.

## 2. Run the database migration

1. Open your project at https://supabase.com/dashboard
2. Go to **SQL Editor** → **New query**
3. Paste the entire contents of `supabase/phase5_migration.sql`
4. Click **Run**

This migration:
- Adds `hires.escrow_id` (stores the on-chain escrow number once funded) — this column didn't exist before and the app needs it.
- Adds a `UNIQUE` constraint on `hires.application_id` (an application should only ever become one hire — this was never enforced, and enforcing it is also what lets Supabase return a single `hire` object instead of an array when embedded under `applications`).
- Widens `jobs.budget`, `applications.proposed_amount`, and `hires.amount` from `numeric(12,2)` to `numeric(18,8)`. **This matters:** `JobDetails.jsx` already lets freelancers propose amounts with 4 decimal places (e.g. `0.0055`), but `numeric(12,2)` would have silently rounded that to `0.01` before it ever reached the blockchain — meaning the escrow would have been funded with the wrong amount. `numeric(18,8)` matches the precision already used by `blockchain_transactions.amount`.

It's safe to run even if you've already run `phase2_migration.sql` — it only adds/widens columns, it doesn't drop anything.

## 3. What's new in the app

| File | What it does |
|---|---|
| `src/lib/blockchain.js` | All Ethers.js / MetaMask logic: connecting, detecting/switching network, funding an escrow, reading an escrow. Nothing else in the app imports `ethers` directly. |
| `src/lib/escrowApi.js` | Supabase reads/writes for hires and `blockchain_transactions`. |
| `src/context/WalletContext.jsx` | Shares wallet connection state across the whole app. |
| `src/components/WalletButton.jsx` | Lives in the navbar. Shows "Connect Wallet", then a shortened address, and a "Switch to Sepolia" button if you're on the wrong network. |
| `src/components/TransactionStatus.jsx` | Shows pending / success / rejected / failed, with a link to Sepolia Etherscan once there's a transaction hash. |
| `src/pages/EscrowFunding.jsx` (`/hires/:hireId/fund`) | The client funds the escrow here. The freelancer and admin can open the same page to see status only (no fund button). |
| `src/pages/ContractDetails.jsx` (`/contract`) | Shows the deployed contract address and lets anyone look up any escrow by its numeric ID. |

**A necessary addition beyond what was asked:** `Profile.jsx` now has a
"Wallet Address" section, because there was previously no way for a
freelancer (or client) to save a wallet address anywhere in the UI, even
though `profiles.wallet_address` already existed in the database. Without
this, funding an escrow would have had nowhere to get a freelancer's
address from. It works by reusing the same `WalletButton`/`WalletContext` —
connect, then click "Use my connected wallet."

## 4. The UUID ↔ uint256 problem (and how it's solved)

Your `jobs.id` values are Postgres UUIDs (e.g.
`3fa85f64-5717-4562-b3fc-2c963f66afa6`), but the smart contract's
`createEscrow(uint256 jobId, ...)` expects a plain number. `blockchain.js`
converts between the two automatically:

- `jobIdToUint256(uuid)` — strips the dashes from the UUID and reads the
  remaining 32 hex characters as one big number. Every UUID maps to a
  unique number this way.
- `uint256ToJobId(number)` — reverses that, so `ContractDetails.jsx` can
  show the original WorkTrust job ID when you look up an escrow.

You never call these directly — `fundEscrow()` and `getEscrowOnChain()`
handle the conversion internally.

## 5. End-to-end manual test

1. **Register two accounts:** one client, one freelancer (use two
   different browser profiles or incognito windows, since MetaMask is
   per-browser-profile).
2. **Freelancer:** log in → Profile → click "Connect Wallet" in the
   navbar → approve in MetaMask → click "Use my connected wallet" → confirm
   "Wallet address saved."
3. **Client:** log in → Post a New Job → note the budget you set (try a
   value with several decimals, e.g. `0.0123`, to confirm the precision
   fix works).
4. **Freelancer:** Browse Jobs → open the job → Apply with a proposed
   amount.
5. **Client:** Dashboard → View Applications → Hire the freelancer. You
   should land directly on `/hires/<id>/fund`.
6. **Client:** click "Connect Wallet" in the navbar if not already
   connected. If MetaMask is on the wrong network, click "Switch to
   Sepolia" — approve it in the popup.
7. **Client:** click **Fund Escrow**. MetaMask pops up asking you to
   confirm sending Sepolia test ETH. Approve it.
   - You should immediately see a **pending** banner with a link to the
     transaction on Sepolia Etherscan.
   - After the transaction is mined (a few seconds to a minute), the
     banner should change to **success**, and the card above should now
     show an Escrow ID and status "funded."
8. **Try to fund it again:** the "Fund Escrow" button should no longer
   appear at all — you'll see "This job's escrow is funded" instead. This
   is the duplicate-funding prevention.
9. **Freelancer:** go back to their dashboard → the application should
   now show an "Escrow: funded" badge and a "View Escrow" button. Clicking
   it should show the same status, but with no Fund button (since they're
   not the client).
10. **Reject a transaction on purpose:** try funding a *different* hire
    and click **Reject** in the MetaMask popup instead of confirming. You
    should see the "Transaction was rejected in MetaMask" banner, and
    nothing should be written to `blockchain_transactions` (rejections
    happen before there's a transaction hash to log).
11. **Wrong network test:** in MetaMask, manually switch to a different
    network (e.g. Ethereum Mainnet). The navbar's WalletButton should
    immediately turn into a "Wrong network — Switch to Sepolia" warning
    button, without needing a page refresh.
12. **Account change test:** in MetaMask, switch to a different account.
    The navbar should immediately update to show the new shortened
    address, again without a page refresh.
13. **Contract Details page:** go to `/contract`, enter the escrow ID
    from step 7, and confirm the on-chain data (client, freelancer,
    amount, status) matches what you expect.

## 6. Known limitations to mention in your report

- The client and freelancer must each be using MetaMask with Sepolia test
  ETH (get some from a faucet like https://sepoliafaucet.com).
- If a freelancer changes their saved wallet address *after* being hired
  but *before* being funded, the app will use their current profile
  address at the moment of funding (not a stale one) — the actual address
  used gets snapshotted onto the `hires` row for the permanent record.
- Releasing payment, raising disputes, and admin dispute resolution are
  not part of this phase — they'll use the same `blockchain.js` module in
  a later phase (the contract functions `releasePayment`, `raiseDispute`,
  and `resolveDispute` are already in the ABI and ready to be wired up).
