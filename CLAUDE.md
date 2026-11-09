# Working agreement

- Vercel deploys **Production** from the `main` branch. Any other branch only
  produces a separate Preview URL that Josh has to open manually.
- Josh does not want to manually merge or deploy anything. Once a fix or
  change has been made, verified (build + tests pass), and committed, **merge
  it into `main` and push `main` directly** (or open a PR and merge it
  yourself) so Vercel's production deployment updates automatically — do not
  leave finished work stranded on a feature/working branch waiting for a
  manual merge.
- Only skip the direct-to-main push if Josh explicitly asks for a PR-only
  workflow for a specific change, or if the change is large/risky enough that
  a manual review makes sense — say so and ask first in that case.

# Base44 sync (standing rule from Josh)

- The same app also lives in Base44 as **"Orato"** (app id `6aee01ef8bca758ff2570f86`,
  branch `main`, TanStack Start, JavaScript `.jsx` — not `.tsx`, and it has no `DESIGN.md`).
- **Every change made here must also be applied to the Base44 app**, not only to
  GitHub/Vercel. Use the Base44 connector tools (`edit_file` / `run_command` for direct
  edits, no builder credits), run the tests and `vite build` there, then finish with
  `create_checkpoint` (otherwise a Restore in the builder discards the edits).
- Do not edit while the app status is `processing`.
- **Also publish it** (Josh confirmed): after the checkpoint, deploy that checkpoint with
  `execute_api` `POST /api/apps/{app_id}/deploy` and body `{"checkpoint_id": "<id>"}`.
  Live URL: https://orato.base44.app
