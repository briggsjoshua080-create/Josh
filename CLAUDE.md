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
