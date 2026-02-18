# Specification

## Summary
**Goal:** Roll back Bree's Favorites to deployment/version 42 and ensure all future deploys deterministically deploy version 42.

**Planned changes:**
- Revert the full repository (frontend + backend) to the version 42 state, removing any changes introduced after version 42.
- Update/verify build and deployment pipeline/scripts so they are pinned to version 42 as the single source of truth and cannot accidentally deploy a newer version.
- Confirm a clean build and deploy succeeds from the reverted version 42 codebase.

**User-visible outcome:** The deployed app behaves exactly as it did in version 42, and repeated deployments consistently redeploy the same version 42 artifacts and behavior.
