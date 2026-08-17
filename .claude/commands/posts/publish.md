Publish the draft post: $ARGUMENTS

1. Read the post under content/posts/
2. Set draft = false in the front matter
3. Check images exist under static/ and that Markdown links look sane
4. Run `zola build` (no drafts) and confirm it succeeds
5. Stage content and docs/, commit with a clear message, push

Do not invent extra site-wide refactors.
