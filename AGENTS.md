# AGENTS.md

## Cursor Cloud specific instructions

This repository is a Zola static site (blog "abijango"). See `CLAUDE.md` for the full project overview and standard commands.

### Services

There is a single service: the Zola development server.

- Run the dev server (with drafts, live reload): `zola serve --drafts --interface 0.0.0.0 --port 1111`, then open `http://localhost:1111`.
- Build the static site: `zola build` (output goes to `docs/`, per `output_dir` in `config.toml`).
- Checks: `zola check` validates links/content. There is no separate unit-test suite; a clean `zola build` / `zola check` is the effective check.

### Non-obvious caveats

- Zola **0.22+** is required (installed in the environment/snapshot). Verify with `zola --version`.
- This site has no per-project dependencies to install and no theme submodule (the previous Hugo `archie` submodule was removed in the Zola migration). Sass is compiled by Zola itself (`compile_sass = true`), so no separate Sass toolchain is needed.
- `zola build` writes output into the git-tracked `docs/` directory (GitHub Pages source). Running a build locally will show `docs/` diffs; do not commit incidental build churn from setup/testing. Use `git checkout -- docs` (and `git clean -fd docs`) to discard, or only commit `docs/` when intentionally deploying.
- Draft posts (`draft = true`) only appear when serving/building with `--drafts`. Front matter uses TOML (`+++` fences) with `[taxonomies]` for tags and `[extra]` for author.
