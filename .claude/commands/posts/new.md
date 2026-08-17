Create a new blog post with the title: $ARGUMENTS

1. Generate a kebab-case filename with today's date: `YYYY-MM-DD-title-slug.md`
2. Create `content/posts/YYYY-MM-DD-title-slug.md` with TOML front matter:
   - title
   - date (RFC3339 or YYYY-MM-DD)
   - draft = true
   - description
   - [taxonomies] tags = ["..."]
   - [extra] author = "abijango"
3. Leave a short body placeholder
4. Show how to preview: `zola serve --drafts`

US English. Do not run a production deploy.
