# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo static site generator project for a personal blog called "abijango". The site uses the **Archie** theme, a minimal and clean Hugo theme with markdown-ish UI. Hugo version 0.152.0+ is required.

## Key Commands

### Build and Serve

- **Build the site for production:**
  ```bash
  hugo
  ```
  This generates static HTML files in the `public/` directory ready for deployment.

- **Serve locally with live reload (development):**
  ```bash
  hugo server
  ```
  Access the site at `http://localhost:1313` (default port). The site auto-reloads when you make changes to content or templates.

- **Build including draft content:**
  ```bash
  hugo -D
  ```

### Content Management

- **Create a new blog post:**
  ```bash
  hugo new posts/post-name.md
  ```
  This generates a new markdown file in `content/posts/` with the default archetype.

- **Create a new page:**
  ```bash
  hugo new page-name.md
  ```

## Project Structure

```
.
├── content/              # All markdown content files
│   ├── posts/           # Blog posts (main content type)
│   ├── homepage/        # Homepage sections (about, work, etc.)
│   ├── about.md
│   ├── archives.md
│   └── _index.md        # Home page content
├── themes/archie/       # Active Archie theme (git submodule)
├── themes/ananke/       # Ananke theme (alternate, unused)
├── themes/hugo-book/    # Hugo Book theme (alternate, unused)
├── layouts/             # Custom layout overrides (if any)
├── assets/              # Custom CSS and other assets
├── archetypes/          # Content templates for hugo new
├── public/              # Generated static site (build output)
├── hugo.toml            # Main Hugo configuration
└── .gitmodules          # Git submodule configuration
```

## Architecture & Theme Configuration

### Archie Theme

The Archie theme provides:
- **Minimal design** with markdown-ish styling
- **Dark mode support** with auto/light/dark/toggle modes (configured via `params.mode`)
- **Blog features**: tags, archives, syntax highlighting, table of contents, Disqus comments
- **Responsive layout** for mobile and desktop
- **Callout shortcodes** for styled notes (alert, warning, tip, custom types)
- **Math support**: MathJax and KaTeX can be enabled in config

### Core Configuration

The `hugo.toml` file controls:
- **baseURL**: Currently set to `http://localhost` (change for production)
- **theme**: Set to "archie"
- **languageCode**: "en-us"
- **title**: "abijango"

### Content Front Matter Format

Blog posts use this structure (see `content/posts/post-1.md` for example):
```yaml
---
title: "Post Title"
date: 2025-04-01T02:01:58+05:30
description: "Short description shown in lists"
tags: [tag1, tag2]
draft: false
toc: true          # Enable table of contents (optional)
tldr: "Summary"    # Short takeaway (optional)
---
```

## Theme Customization Points

### Custom CSS

Place custom CSS files in `assets/css/` and reference them in `hugo.toml`:
```toml
[params]
customcss = ["css/custom.css"]
```

### Callouts

Use shortcodes for styled callout boxes:
- **Alert**: `{{< callout type="alert" text="Message" >}}`
- **Warning**: `{{< callout type="warning" text="Message" >}}`
- **Tip**: `{{< callout type="tip" text="Message" >}}`
- **Custom**: `{{< callout type="custom" emoji="⚡️" title="Title" text="Message" style="..." >}}`

### Social Links & Navigation

Edit `hugo.toml` to add social media links and modify the main menu navigation.

## Theme Management

The project uses **git submodules** for theme management:
- **Archie** (active theme): `themes/archie/`
- **Ananke** & **Hugo-book**: Alternate themes (not currently in use)

To update themes:
```bash
git submodule update --remote themes/archie
```

## Important Notes

- The `public/` directory is generated on each build and should not be manually edited
- Draft posts (with `draft: true`) won't appear in production builds unless using `hugo -D`
- The site is currently configured for `localhost` — update `baseURL` in `hugo.toml` before deploying
- Resources in `resources/_gen/` are auto-generated cache files
