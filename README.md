# WorkTrust

WorkTrust is a freelance marketplace prototype that connects clients and freelancers, supports job and proposal workflows, and integrates escrow and dispute handling. The frontend is built with React and Vite, uses Supabase for application data and authentication, and interacts with an existing Solidity escrow contract through ethers.js.

> **Status:** This project is intended for development and testnet demonstrations. Review database access policies, authentication settings, and contract configuration before making it publicly available. Do not use real funds unless the system has received a thorough security review.

## Features

- Client and freelancer marketplace workflows
- Job posting and proposal/application flows
- Work submission and review
- Escrow interaction through the existing smart contract
- Dispute creation and administration flows
- Supabase-backed authentication and data
- React/Vite frontend

Features and available pages depend on the version of the project currently deployed.

## Technology

- React
- Vite
- Supabase (authentication and database)
- ethers.js (Ethereum interaction)
- Solidity escrow contract in `contracts/`

## Requirements

- Node.js and npm
- A Supabase project configured for this application
- A browser wallet such as MetaMask for blockchain features
- Sepolia testnet configuration and test ETH for escrow testing

## Run locally

1. Clone the repository and enter the project root—the directory containing `package.json` and `vite.config.js`:

   ```bash
   git clone https://github.com/sanjaysah2006/worktrust.git
   cd worktrust
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local `.env` file in the project root. Set the browser-safe Supabase project URL and publishable/anon key:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Create a production build locally with:

   ```bash
   npm run build
   ```

## Supabase setup

The repository includes database migrations under `supabase/`. For a **new** Supabase project, review the migration files and project guides, then apply the migrations in the documented order. The project has previously used `phase2_migration.sql`, `phase5_migration.sql`, and `phase6_migration.sql`; confirm the current schema and migration status before applying anything. Do not rerun migrations against an existing database without checking their effects.

Configure Supabase Auth with the site URL and redirect URLs for your local and deployed environments. Use appropriate Row Level Security (RLS) policies for every exposed table and verify role assignment is performed securely.

## Blockchain configuration

The project includes an escrow contract under `contracts/` and frontend blockchain configuration under `src/lib/`. Check the configured contract address, network, and chain ID against the contract actually deployed to the test network before testing. The previously tested network was Sepolia (chain ID `11155111`). Never put a wallet private key or server-side secret in frontend code or a `VITE_` environment variable.

## Deploy to Vercel

Import the GitHub repository into Vercel and configure the project to build the root Vite application:

- **Root Directory:** `./` (the directory containing the root `package.json` and `vite.config.js`)
- **Framework Preset:** Vite
- **Build Command:** `npm run build -- --base=/`
- **Output Directory:** `dist`

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's environment variable settings for the deployment environments you use. These values are embedded in a browser application; use only the Supabase publishable/anon key, never a service-role or secret key. Redeploy after changing environment variables or build settings.

The repository contains additional nested application folders. Deploy the root application unless you intentionally want a different app; do not assume the nested frontend or backend is part of the root app's deployment.

## Environment and secrets

- Keep `.env` out of Git. Do not commit credentials, database passwords, service-role/secret keys, or wallet private keys.
- Before publishing, inspect `.env.example` and ensure it contains placeholders only—not copied values from `.env`.
- If a private credential was committed, revoke or rotate it; deleting it in a later commit does not erase it from Git history.

## Project layout

```text
contracts/       Solidity escrow contract and related files
src/             React application source
supabase/        Database migrations and Supabase-related files
WorkTrust/       Additional nested project; separate from the root Vite app
```

## Testing checklist

Before sharing a deployment, test in separate client, freelancer, and administrator accounts:

1. Sign up/sign in and confirm role permissions.
2. Create a job and submit a proposal.
3. Hire a freelancer and test escrow funding on Sepolia.
4. Submit work and review/approve it.
5. Exercise the dispute flow and verify the appropriate users can access the relevant data.
6. Refresh a nested route directly and confirm it loads.
7. Check Supabase RLS policies and browser console/network errors.

## License

No license is specified yet. Unless a license is added, standard copyright restrictions apply; ask the repository owner before reusing or distributing this code.
