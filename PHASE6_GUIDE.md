# WorkTrust — Phase 6: Submissions, Approval & Disputes

This phase completes the escrow workflow: the freelancer submits work, the
client approves it on-chain (releasing payment), and either side can raise
a dispute for an administrator to resolve.

## 1. Run the database migration

1. Open your project at https://supabase.com/dashboard
2. Go to **SQL Editor** → **New query**
3. Paste the entire contents of `supabase/phase6_migration.sql`
4. Click **Run**

This migration:
- Adds `submissions.github_url` (the spec asks for a message, a project URL, *and* a GitHub URL, but only one `url` column existed before).
- Widens the `blockchain_transactions.tx_type` check constraint to also allow `'dispute'` — raising a dispute is a real signed transaction (it costs gas) even though no funds move.

No RLS policy changes were needed — the phase2 policies for `hires`, `submissions`, `disputes`, and `blockchain_transactions` already cover every action in this phase (client releases/reviews, client-or-freelancer disputes, admin-only resolution).

## 2. What's new in the app

| File | What it does |
|---|---|
| `src/lib/submissionsApi.js` | Supabase reads/writes for submissions. |
| `src/lib/disputesApi.js` | Supabase reads/writes for disputes, including the admin's open-disputes list. |
| `src/lib/escrowApi.js` (extended) | Added `markHireReleased` and `fetchMyTransactions`. |
| `src/lib/blockchain.js` (extended) | Added `releaseEscrowPayment`, `raiseEscrowDispute`, `resolveEscrowDispute`, and `getContractAdmin` (reads the contract's admin address so the UI can warn if the wrong wallet is connected). |
| `src/pages/SubmitWork.jsx` (`/hires/:hireId/submit`) | Freelancer submits a message, project URL, and GitHub URL once the escrow is funded. No blockchain transaction — this is a database-only record. |
| `src/pages/ReviewSubmission.jsx` (`/hires/:hireId/review`) | Client reviews the latest submission. **Approve & Release** sends a MetaMask transaction calling `releasePayment`; **Reject & Ask to Resubmit** is a database-only action with no blockchain cost. |
| `src/pages/RaiseDispute.jsx` (`/hires/:hireId/dispute`) | Client or freelancer explains the problem and sends a MetaMask transaction calling `raiseDispute`, locking the funds. |
| `src/pages/AdminDisputes.jsx` (`/admin/disputes`) | Admin's list of open disputes. |
| `src/pages/AdminDisputeDetails.jsx` (`/admin/disputes/:disputeId`) | Full case file (job, both parties, submitted work, dispute reason) with **Release to Freelancer** / **Refund Client** buttons, each sending a MetaMask transaction calling `resolveDispute`. |
| `src/pages/TransactionHistory.jsx` (`/transactions`) | Every blockchain transaction the logged-in user is allowed to see (their own hires, or everything for an admin). |

`EscrowFunding.jsx` (the page from Phase 5) was extended to link into all of this: once an escrow is `funded`, it shows submission status with **Submit Work** / **Review Submission** / **Raise a Dispute** buttons depending on your role; once `disputed`, it shows the reason and (for admins) a direct link to resolve it.

## 3. Database updates only happen after the blockchain confirms

Every action that touches money follows the same pattern used in Phase 5:

1. Send the transaction, get a hash back from MetaMask.
2. Immediately log a `blockchain_transactions` row with `status: 'pending'`.
3. Wait for the transaction to be mined.
4. Only then — and only if it succeeded — update `status: 'confirmed'` and update the `hires`/`submissions`/`disputes` rows (e.g. `escrow_status: 'released'`).
5. If it failed or was rejected, the transaction row is marked `'failed'` (or never created at all, for a rejection before a hash existed) and no `hires`/`submissions`/`disputes` row changes.

The one exception is **Reject & Ask to Resubmit** on `ReviewSubmission.jsx` — no money moves, so it's a plain database update with no blockchain step.

## 4. Wallet safety checks

Two checks were added specifically because the contract enforces exact addresses:

- **RaiseDispute.jsx** compares your connected wallet to the client/freelancer address recorded on the hire. If they don't match, the button is disabled with an explanation — the contract would otherwise revert.
- **AdminDisputeDetails.jsx** reads the contract's actual `admin()` address and compares it to your connected wallet, disabling the resolve buttons with a warning if you're on the wrong account.

## 5. End-to-end manual test

Continuing from the Phase 5 test (client has hired and funded a freelancer):

1. **Freelancer:** open the hire's Escrow page (Dashboard → application → View Escrow) → click **Submit Work** → fill in a message, a project URL, and a GitHub URL → Submit. You should land back on the Escrow page showing "Latest submission: submitted."
2. **Client:** open the same Escrow page → click **Review Submission** → confirm you can see the message and both links (they should be clickable and open in a new tab).
3. **Client — try Reject first:** click **Reject & Ask to Resubmit**, confirm the prompt. The submission should now show "rejected" with no blockchain transaction involved (check `/transactions` — nothing new should appear).
4. **Freelancer:** go back to Submit Work — you should be able to submit again (a rejected submission doesn't block resubmission).
5. **Client:** Review Submission again → click **Approve & Release <amount> ETH** → confirm in MetaMask.
   - You should see a **pending** banner, then **success** once mined.
   - The Escrow page should now show status "released", and the freelancer's Sepolia balance should have increased by the escrow amount.
6. **Check `/transactions`** as both the client and the freelancer — each should see a `release` row marked `confirmed`, linking to Etherscan.
7. **Dispute flow — start a second hire** (repeat the Phase 5 hire+fund steps for a different job) so you have a `funded` escrow to dispute.
8. **Freelancer or client:** on that hire's Escrow page, click **Raise a Dispute**, write a reason, submit, confirm in MetaMask. You should land back on the Escrow page showing "This escrow is disputed."
9. **Wallet mismatch test:** before doing step 8, try switching MetaMask to a *different* account first — the Raise Dispute button should be disabled with a clear warning, instead of letting you send a transaction that would just revert.
10. **Admin:** log in as your admin account → **Disputes** in the navbar → the open dispute should be listed → click **Review Dispute** → confirm you can see the job, both parties, the dispute reason, and (if one was submitted) the freelancer's work.
11. **Admin wallet check:** if your admin's connected MetaMask account isn't the exact address that deployed the contract, the resolve buttons should be disabled with a warning telling you which address to switch to.
12. **Admin:** click **Release to Freelancer** (or **Refund Client**), confirm the browser prompt, then confirm in MetaMask. After it's mined, the dispute should show as resolved and the hire's escrow status should update accordingly.
13. **Rejected-transaction test:** try any of the above actions and click **Reject** in the MetaMask popup instead of confirming — you should see "Transaction was rejected in MetaMask" and no database row should have changed.
14. **Wallet-disconnected test:** open any of these pages in a fresh browser/incognito session without connecting MetaMask — the action buttons should be disabled with a "Connect your wallet" message rather than erroring.

## 6. Known limitations to mention in your report

- There's no notification system — the client only learns work was submitted (or the freelancer learns a dispute was raised) by visiting the app.
- An open dispute has no built-in messaging between the admin and the two parties beyond the original reason text; any back-and-forth would happen outside the app.
- Only one admin wallet (the contract deployer) can resolve disputes. A production system would likely use a multisig instead of a single admin key — this is called out in the contract's own security review document from Phase 4.
