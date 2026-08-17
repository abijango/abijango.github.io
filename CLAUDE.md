# CLAUDE.md

Guidance for working in this repository.

## Project Overview

Personal blog **abijango**, built with [Zola](https://www.getzola.org/) (Rust static site generator). Requires Zola **0.22+**.

Published at `https://abijango.github.io` via GitHub Pages from the `docs/` folder on `main`.

## Key Commands

### Build and serve

```bash
zola serve          # local preview at http://127.0.0.1:1111
zola serve --drafts # include draft posts
zola build          # production build into docs/
zola build --drafts # build including drafts
zola check          # link checker
```

### Content

Create posts by adding Markdown under `content/posts/`:

```toml
+++
title = "Post Title"
date = 2026-08-17T12:00:00Z
draft = true
description = "Short description"
[taxonomies]
tags = ["necromunda"]
[extra]
author = "abijango"
+++

Body goes here.
```

Suggested filename: `YYYY-MM-DD-kebab-title.md`.

Images go in `static/` and are referenced from the site root, e.g. `![alt](/photo.jpg)`.

## Project Structure

```
.
├── config.toml          # Zola site config (base_url, output_dir=docs)
├── content/
│   ├── _index.md        # Home
│   ├── about.md
│   └── posts/           # Blog section + posts
├── templates/           # HTML templates (Tera)
├── sass/main.scss       # Styles (compiled to docs/main.css)
├── static/              # Copied as-is (images, etc.)
└── docs/                # Generated site (GitHub Pages artifact)
```

## Deploy

1. `zola build` (no `--drafts`)
2. Commit content + `docs/`
3. Push `main` so GitHub Pages can serve `/docs`

Agent helpers live under `.claude/commands/posts/` and `.claude/commands/site/`.
