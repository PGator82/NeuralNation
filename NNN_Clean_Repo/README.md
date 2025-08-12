
# Neural Nation (NNN) — Clean Repo

This package contains the consolidated smart contracts, scripts, and frontend pages chosen as the **latest/most complete** from multiple bundles.

## Structure
- `contracts/` — Solidity (Polygon) contracts
- `scripts/` — Hardhat/utility scripts
- `hardhat/` — Baseline Hardhat config, package.json, and `.env.example`
- `frontend/pages/` — Next.js/React pages for dashboard features
- `docs/` — (optional) GitHub Pages landing site

## Next steps
1. Move this into your repo root and commit.
2. Install hardhat deps:
   ```bash
   cd hardhat
   npm install
   ```
3. Configure networks in `hardhat.config.ts` and fill `.env`.
4. Build/run frontend according to your chosen framework.
5. Set up GitHub Pages (`/docs`) or Actions for dashboard deploy.
