Verify all image references exist for post(s): $ARGUMENTS

1. Read the specified post(s)
2. Extract Markdown image references: `![alt](path)`
3. Paths starting with `/` map to `static/` (e.g. `/neon-shrikes.jpg` → `static/neon-shrikes.jpg`)
4. Report totals, verified paths, and any missing files with a fix suggestion

Keeps posts from shipping broken image links.
