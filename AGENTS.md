# AGENTS.md

## Cursor Cloud specific instructions

This repository is a Hugo static site (blog "abijango") using the `archie` theme. See `CLAUDE.md` for the full project overview and standard commands.

### Services

There is a single service: the Hugo development server.

- Run the dev server (with drafts, live reload): `hugo server -D --bind 0.0.0.0 --port 1313 --baseURL http://localhost`, then open `http://localhost:1313`.
- Build the static site: `hugo` (output goes to `docs/`, per `publishDir` in `hugo.toml`). Hugo has no separate lint or automated test suite; a clean `hugo` build is the effective check.

### Non-obvious caveats

- Hugo **extended** v0.152.0+ is required (installed in the environment/snapshot). Verify with `hugo version` — the output must include `+extended`.
- The `archie` theme lives in `themes/archie` as a git submodule and must be checked out or the build fails with a missing-theme error. The startup update script runs `git submodule update --init --recursive` to handle this.
- `hugo` writes build output into the git-tracked `docs/` directory (GitHub Pages source). Running `hugo` locally will show `docs/` diffs; do not commit incidental build churn from setup/testing. Use `git checkout -- docs` to discard, or only commit `docs/` when intentionally deploying.
- Draft posts (`draft: true`) only appear when running with `-D`. `hugo new posts/<name>.md` creates drafts by default.
