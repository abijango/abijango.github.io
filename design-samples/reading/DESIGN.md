# Reading journal: design spec ("Terminal ledger")

Status: design sample, example data only. Nothing here calls an API. This document describes the sample in this folder and how each part would be fed once a Worker exists.

Files: `index.html` (main page), `book.html` (per-book share page, `?b=<slug>`), `og.html` (1200x630 year card, `assets/og.png` is a screenshot of it), `assets/reading.css`, `assets/reading.js`, `assets/book.css`, `assets/book.js`, `assets/og.js`, `assets/data.js` (example data + placeholder-cover generator, to be replaced by Worker responses), `assets/fonts/` (JetBrains Mono, same files as the site).

Data sources below come from `discovery.md` (BookOrbit v3.8.0 read-only key). Endpoint paths are relative to `/api/v1`. Nothing is added beyond what that file lists. Where a section has no listed source, it says **No source**.

## 1. Idea

The reading log is another page of the existing site, not a separate app. Same Tokyo Night background, JetBrains Mono at weight 300/700, hairline borders, 2px radii, link colour `#7dcfff`. Terminal vocabulary: a `~/reading $ cat 2026.log` prompt, `##` section headings, `//` stat labels, `$` panel headings, segmented block progress bars. Covers are the only imagery.

Two colours carry meaning everywhere: green `#9ece6a` = read, purple `#bb9af7` = listened. Blue `#7aa2f7` is the neutral accent (active tab, goals not yet met, funnel). Orange `#ff9e64` marks an overshoot (`+14%`) or the favourite weekday. Amber `#e0af68` is for star ratings and the "sample data" tag.

## 2. Layout and section order

Container: `min(100% - 2rem, 70rem)`, centred. The existing site is a 44rem column; the reading page is wider (70rem) because of the cover wall and calendar. The mock site header (brand + `posts about reading feed`) is reused so the page sits inside the site chrome. A slim "sample bar" at the very top exists only in the design sample and is removed in production.

Section order, top to bottom (identical on desktop and mobile):

| # | Section | Contents |
|---|---|---|
| 0 | Header | Site brand + nav (`reading` highlighted green) |
| 1 | Hero | Prompt line, `h1` "Reading log", one-line lede, year switcher (`2026`, `2025`, `all-time`), 4 headline stat blocks |
| 2 | `## now reading` | Up to 4 cards: cover, status + format, title, author, progress bar, percent, ETA |
| 3 | `## goals` | Goal rows with segmented bars, `N of M goals met` line, goal-trajectory panel |
| 4 | `## shelf` | Filter chips (all / read / listened), hover status line, finished covers grouped by month |
| 5 | `## stats` | Titles per month, daily heat calendar, when I read (24 hours), favourite days, pace and sessions (6 tiles), progress funnel |
| 6 | `## share` | Year card preview (links to `og.html`), per-book page teaser (links to `book.html`) |
| 7 | Footer | Sample-data note (production: "updated N min ago") |

Desktop (>= 861px):
- Headline stats: 4 columns in one bordered block, column dividers.
- Now reading: 2 x 2 grid of cards separated by 1px lines.
- Goals: 3-column rows (label 9.5rem, bar, value 11rem).
- Shelf: months in 2 columns (`column-gap 2.5rem`), each month a heading line then a row of covers.
- Stats: months chart and heat calendar full width; "when I read" and "favourite days" side by side; pace tiles 3 across.
- Share: 1.4fr / 1fr.

Mobile (390px reference):
- <= 860px: headline stats 2 x 2; now-reading 1 column; goal rows collapse to label + value on the first line and the bar full width below; hour and weekday panels stack; pace tiles 2 across; shelf 1 column; share cards stack.
- <= 520px: smaller shell padding, covers 4.4-5.2rem, months chart 10rem tall, panel padding tightens, the `$` heading prefix and sample-bar title are hidden, `sec-note` wraps below its heading.
- The heat calendar keeps its desktop cell size and scrolls horizontally inside its panel (starts scrolled to "today"). Everything else must not scroll sideways. Verified at 390px for 2026, 2025 and all-time: no horizontal overflow.

## 3. Type scale

One family: JetBrains Mono (Light 300 for body, Regular 400, Bold 700 for headings and numbers). No second face. Numbers use `font-variant-numeric: tabular-nums`.

| Role | Size | Weight | Notes |
|---|---|---|---|
| `h1` | `clamp(2rem, 6vw, 3.1rem)` | 700 | letter-spacing -0.03em, line-height 1.1, colour `#fff` |
| Headline stat value | `clamp(1.9rem, 4vw, 2.7rem)` | 700 | letter-spacing -0.03em; unit in `small` at 0.45em, `--sub` |
| Section heading `## x` | 1.15rem | 700 | `##` in blue |
| KPI tile value | 1.5rem | 700 | unit at 0.55em |
| Brand | 1.5rem | 700 | same as live site |
| Book title (card) | 0.98rem | 700 | |
| Lede | 1.02rem | 300 | colour `#7aa2f7`, as the live site's `.lede` |
| Body / row text | 0.78-0.85rem | 300-700 | goal labels 0.85rem bold |
| Meta, notes, chart labels | 0.64-0.78rem | 300 | `--dim` or `--sub` |
| Axis / tick labels | 0.58-0.68rem | 300 | month, hour, day letters |

Base `html` font size is 16px, body line-height 1.6.

## 4. Colour tokens

Defined on `:root` in `assets/reading.css`. The first four match the live site's `sass/main.scss`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#1a1b26` | page |
| `--ink` | `#c0caf5` | body text |
| `--line` | `rgba(65,72,104,.8)` | borders (live site `--line`) |
| `--heading` | `#ffffff` | headings, big numbers |
| `--panel` | `#1f2335` | stat blocks, panels, goals |
| `--panel-2` | `#24283b` | cover backing, active chip (= live `--code-bg`) |
| `--bg-deep` | `#16161e` | bar tracks, sample bar |
| `--line-soft` | `rgba(65,72,104,.45)` | inner dividers |
| `--sub` | `#a9b1d6` | secondary text |
| `--dim` | `#565f89` | labels, axes, kickers |
| `--blue` | `#7aa2f7` | accent, active states, unmet goal bars, funnel |
| `--cyan` | `#7dcfff` | links (= live `--link`) |
| `--read` | `#9ece6a` | reading, met goal, completed (= live `--marker`) |
| `--listen` | `#bb9af7` | listening |
| `--warn` | `#e0af68` | stars, sample tag |
| `--hot` | `#ff9e64` | overshoot, favourite day |

Heat ramp (reading): `#20233a` (none), `#2f4a3b`, `#46703f`, `#6a9a4c`, `#9ece6a`. Listening ramp: `#3b3558`, `#5a4c8e`, `#8f77d0`, `#bb9af7`. Placeholder cover accents cycle through the Tokyo palette (blue, purple, cyan, green, amber, red, orange, teal). They disappear once real covers are used.

Radius is 2px everywhere (matches the site). Borders are 1px. No shadows except the cover wall (`0 6px 16px -8px rgba(0,0,0,.7)`).

## 5. Components

**Stat block** (`.stat`). Four in a bordered, `--panel` block. Structure: `// label` (0.72rem, `--dim`), value (bold, big), sub line (0.74rem). The sub line carries a coloured split ("24 read, 6 listened"). 2 x 2 on mobile.

**Progress bars** (`.bar`). 0.7rem tall (0.9rem in goals), 1px border, `--bg-deep` track. The fill is a solid colour; a repeating-gradient overlay cuts it into 20 blocks (each 5%, 2px gaps), which gives the terminal look at any width. Colours: green = read or goal met, purple = listening, blue = goal in progress. Values over 100% fill the bar and show an orange `+N%` instead of the percent.

**Now-reading card** (`.now`). Grid: cover 5.5rem + text column. Text: `reading | listening | paused` in the status colour, a format label, bold title, author, bar, `NN%` left and ETA right. Hover tints the card background to `--panel`.

**Goal row** (`.goal`). Label + sub-label, bar, value `30 / 32` (bold current), percent or overshoot. Below the list: a one-line summary ("2 of 4 goals met with 36 days to go"). The goal-trajectory panel (`.traj`) is an SVG line chart: dashed blue = straight-line target pace, solid green = cumulative titles finished, month axis `jan..dec`, and a read-out sentence ("30 finished vs 29.3 on target pace: 0.7 ahead by nov").

**Cover wall** (`.wall`). Grid `repeat(auto-fill, minmax(5.6rem, 6.6rem))`, gap 0.75rem (0.55rem on phones). Covers are 2:3 with a 1px border. A 3px bar at the bottom edge marks the kind (green read, purple listened). Hover/focus lifts 4px and turns the border blue; the status line above the wall shows `title . author . finished date . stars`. The chips dim non-matching covers to 14% opacity rather than removing them, so the layout never jumps. Months are headed `nov 2026` with `2 read . 1 heard`. Each cover links to the per-book page. Production covers are the 400x600 thumbnails in the same 2:3 box (the placeholder's left spine and title text are part of the placeholder, not the layout).

**Heat calendar** (`.heat`). GitHub-style grid: 7 rows (Sun to Sat), one column per week, cells 0.8rem square, 3px gap, 2px radius. Month names above the first week of each month, `mon wed fri` row labels on the left. Levels: 0 = none, 1-4 by the 25th / 50th / 80th percentile of the non-zero days in the current view. A `reading | listening` toggle switches the ramp. Days after today (current year only) are dashed outlines. `title` tooltip: date, minutes read, minutes heard. Legend row under the grid: `less [5 swatches] more` plus total hours and active days.

**Charts.**
- Titles per month: one column per month, stacked read (bottom) + listened (top), count above, month name below, current month label in blue. Max column height 150px. All-time view uses 23 narrow columns with initials.
- When I read: 24 columns (one per hour), stacked read + listened, peak hour brightened, ticks at `00 06 12 18 23`, sentence below naming the reading peak and the listening peak.
- Favourite days: seven rows Mon to Sun: weekday, stacked bar scaled to the busiest day, hours. The top weekday label is orange. One-sentence caption below.
- Pace and sessions: six `kv` tiles in a 3 x 2 grid (2 x 3 on mobile): average reading session (min), reading pace (pages/h), listening speed, current streak, longest streak, average rating.
- Progress funnel: five rows (`started`, `reached 25%`, `reached 50%`, `reached 75%`, `completed`), bar width relative to `started`, count and percent. Last row green, others blue.

**Chips and toggles** (`.chips button`, `.mode`, `.switch button`). 1px border, 2px radius, mono 0.72-0.85rem. Active = blue text with blue border (chips, modes) or solid blue fill with dark text (year switcher).

**Sample markers.** A yellow `sample data` tag in footers and on the OG card. Production removes the sample bar and the tag.

## 6. Motion and reduced motion

All motion lives inside `@media (prefers-reduced-motion: no-preference)`. Reduced motion therefore gets the final state immediately; there is no fallback to maintain. Verified: zero running animations with `prefers-reduced-motion: reduce`.

| Effect | Spec |
|---|---|
| Fade-up | `.fade` elements: opacity 0 + 10px up to rest, 0.6s, `cubic-bezier(.2,.7,.2,1)`, 45ms stagger via `--i` |
| Bar fill | `scaleX(0)` to 1 from the left, 1.1s, delay 0.15s + 80ms per row |
| Month and hour columns | `scaleY(0)` to 1 from the bottom, 0.9s, 28ms stagger |
| Weekday bars, funnel | `scaleX`, 0.9s, 60-80ms stagger |
| Heat cells | opacity fade, staggered by week column (9ms each) |
| Trajectory line | clip-path wipe left to right, 1.5s |
| Prompt cursor | block cursor blinks, `steps(1)` 1.1s |
| Hover | cover lifts 4px, 0.2s; card background tint |

Only `transform` and `opacity` are animated (plus `clip-path` once). Nothing loops except the cursor.

## 7. Per-book share page (`book.html`)

Route in production would be `/reading/books/<slug>`. Layout: prompt line `~/reading/2026 $ open the-way-of-kings`, then two columns (cover 12-18rem sticky | content); a single column on phones with the cover at 11rem.

Content order: title (`h1`), `author . genre . stars`; an 8-cell fact grid (finished, started, length, time to finish, sessions, average session, pages/day, format); the "take" as a left-ruled blockquote (same style as `.prose blockquote` on the site); a bar sparkline of pages per active day with start/finish dates; actions (`copy link`, `year card`, `all books`); a "link preview" box that imitates a chat unfurl (cover + title + stars + URL). `<meta og:*>` for this page would point at a per-book image, not the year card.

## 8. Year OG card (`og.html`, 1200x630)

Fixed 1200x630 canvas, Tokyo Night background with two faint radial glows. Left: prompt `~/reading $ cat 2026.log`, the year at 150px bold (-8px tracking), `reading log` in blue, then three stats (titles in green, pages in white, hours in purple) with labels. Right: 4 x 2 grid of eight covers. Footer: `abijango / reading` and the domain. A 10px three-colour strip (green / purple / blue) closes the bottom edge. A `sample data` tag sits top right (removed in production). `og.html?raw` renders at exact size for screenshotting; without `raw` it scales down to fit narrow viewports. Safe area: keep text 56-64px from the edges so crops by chat apps do not cut it.

## 9. Data map

Assumptions behind every row: one read-only BookOrbit key (Access Read, no permissions, only the libraries meant to be public). The Worker never passes BookOrbit responses through; each route returns a fixed allow-list of fields. `days` windows on the `user-statistics` routes count back from today, so a past year needs a large `days` plus filtering by `day` in the Worker. `reading-history` and its summary take `year` directly.

| Design section | Sample field | Source (discovery.md) | Notes |
|---|---|---|---|
| Year switcher | `2026`, `2025`, `all-time` | `GET /reading-history/summary` -> `years[]` | `all-time` = no `year` param and `days=3650` on the stats routes |
| Hero: titles finished | `totals.titles` | `GET /reading-history/summary` -> `books` (and `reads`, `rereads`) | `year` param. All-time can also use `GET /user-statistics/summary` -> `completedBooks` |
| Hero: pages read | `totals.pages` | `/reading-history/summary` -> `pages` | |
| Hero: hours reading | `totals.readH` | `/reading-history/summary` -> `seconds` / 3600 | See audio caveat in section 10 |
| Hero: hours listening | `totals.listenH` | **Possibly** `/reading-history/summary` -> `formats[]` (per-format seconds) | Only if audiobooks are a BookOrbit format. discovery.md does not list format values. Otherwise **No source** |
| Hero sub-lines: reading days | `activeDays` | `/reading-history/summary` -> `daysRead` | Or count `daily-reading` days with `readingSeconds > 0` |
| Hero sub-line: listening days | `listenDays` | **No source** | No per-format daily data in discovery.md |
| Hero sub-line: "about N per book" | derived | `pages / books` | Computed client-side |
| Now reading: list, `N in progress` | `current[]` | `GET /dashboard/scrollers/continue-reading` (`limit` <= 50) -> `books`, `total`. `GET /user-statistics/summary` -> `inProgressBooks` for the all-time count | A scroller, so it works with a key. Alternative: `POST /books/query` with `readStatus includesAny [reading, rereading]` |
| Now reading: title, author | | `continue-reading` -> `title`, `authors` | |
| Now reading: percent | `pct` | `continue-reading` -> `readingProgress` | |
| Now reading: status (reading / paused) | `status` | `continue-reading` -> `readStatus.status` (`reading`, `rereading`, `on_hold`) | `listening` is **No source** unless the format is audio (see section 10). `abandoned` is never shown |
| Now reading: format label | "Paperback", "Full-cast audiobook" | `continue-reading` -> `files[].format` (add `format` to the allow-list) | BookOrbit knows file formats, not physical vs e-book vs full-cast. Labels like "Paperback" and "Full-cast" have **No source**; show the file format only |
| Now reading: ETA "~18 days left" | `eta` | derived: `pageCount`, `readingProgress`, pace from `reading-pace` | Computed in the Worker. `pageCount` is on BookCard |
| Now reading: cover | | `GET /books/:id/thumbnail?t=<coverVersion>` | Proxied; see section 11 |
| Goals: titles | `goal` | `/reading-history/summary` -> `goal{target,reached,metOn}` | The one real goal. `metOn` can drive a "goal met on 14 oct" note |
| Goals: pages, audiobooks, hours listened | 3 more rows | **No source** | BookOrbit exposes one goal only. Either drop these rows or take targets from Worker config (not BookOrbit) and compute progress from the hero numbers |
| Goals: "N of M met, 36 days to go" | | derived from the goal rows + today's date | |
| Goal trajectory | `trajectory[]` | `GET /user-statistics/goal-trajectory` -> `points[{year, month, actualCumulative, targetCumulative}]` | Pass `goalBooks` explicitly (it defaults to 12 and does not read the user's goal). Take the number from `/reading-history/summary.goal.target` |
| Shelf: covers, titles, authors | `books[]` | `GET /reading-history` (`year`, `outcomes=completed`, `sort=newest`, `limit` <= 200) -> `title`, `authors[]`, `bookId`, `endedOn`, `rating`, `format`, `coverVersion` | |
| Shelf: month groups | | `endedOn` grouped client-side, or `/reading-history/summary` -> `months[]` | `months[]` item shape is not specified in discovery.md |
| Shelf: read / listened chips and edge colour | `kind` | `/reading-history` -> `format` | Same audio caveat. If audiobooks are not distinct, remove the chips and the purple edge |
| Shelf: hover line stars | `rating` | `/reading-history` -> `rating` | Personal data, privacy decision pending |
| Titles per month | `months[]` | `/reading-history/summary` -> `months[]`, or count `/reading-history` items by `endedOn` month | Read/listened stack depends on format |
| Heat calendar (reading) | `days[].r` | `GET /user-statistics/reading-heatmap` -> `[{day, readingSeconds, progressDelta, eventsCount}]` | Or `daily-reading` (same shape, cheaper). Worker drops `bySource` |
| Heat calendar (listening toggle, tooltip "min heard") | `days[].l` | **No source** | `bySource` is app/device, not listening. Remove the toggle unless per-format daily data exists |
| When I read | `hoursR`, `hoursL` | `GET /user-statistics/peak-hours` -> `[{hour, readingSeconds, eventsCount, byFormat}]` | `byFormat` could give the read/listened stack if audio is a format. Hours use `settings.timezone` (UTC fallback). Drop `bySource` |
| Favourite days | `dowR`, `dowL` | `GET /user-statistics/favorite-days` -> `[{dayOfWeek, readingSeconds, eventsCount, byFormat}]` | Index convention (0 = Sunday or Monday) is not stated; verify before building |
| Pace: average reading session | `avgSession` | `GET /user-statistics/reading-pace` -> mean `durationSeconds` | One point per session. Drop `bucket` |
| Pace: reading pace (pages/h) | `pace` | derived: `/reading-history/summary` `pages` / (`seconds` / 3600) | `reading-pace` has `progressDelta` but no page count, so use the history totals |
| Pace: listening speed (1.25x), average listening session | | **No source** | |
| Pace: current and longest streak | `streak`, `longestStreak` | derived from `daily-reading` (`readingSeconds > 0`) | discovery.md names `daily-reading` the cheapest base for streaks |
| Pace: average rating | `avgRating` | `/reading-history/summary` -> `averageRating` | |
| Progress funnel | `funnel` | `GET /user-statistics/progress-funnel` -> `current{started, reached25, reached50, reached75, completed}` | `previous` could add a "vs last period" delta; not designed |
| Share: year card numbers | | same as hero | |
| Share: year card covers | 8 covers | `/reading-history` items + thumbnails | Pick by rating or recency in the Worker |
| Footer "updated N min ago" | | Worker cache timestamp | Not BookOrbit data |

## 10. Things the design shows that have no (confirmed) source

1. **Everything that depends on audio being distinct from reading.** The design splits read vs listened in the hero, shelf chips, month chart, hours chart, weekday chart, goals and the heat calendar toggle. discovery.md shows `format` / `byFormat` / `formats[]` fields but never says audiobooks are a value. Confirm against BookOrbit before keeping the split. If audio is not a format, the page collapses to reading only: drop purple, the chips, `Audiobooks` and `Hours listened` goals, listening tiles and the calendar toggle.
2. Listening days, listening speed, average listening session, and the heat-calendar "min heard" tooltip and listening mode.
3. Goals for pages, audiobooks and hours listened. BookOrbit exposes one goal (`/reading-history/summary` -> `goal`).
4. Physical format labels ("Paperback", "Hardcover", "Full-cast audiobook") and genre on finished books. `reading-history` items carry `format` only; genre exists only on BookCard (continue-reading / books/query), not in the history list.
5. The per-book "take" (the quote). Personal notes live only in `/books/:id` (`personalNote`) and in annotation and marks routes, all of which discovery.md says not to use. Keep takes as authored content in the site repo (for example front matter), or remove the block.
6. The per-book "pages per active day" sparkline, and the derived "sessions / average session" if needed per book. Per-book sessions are only on `/books/:bookId/sessions` (carries a KOReader `device`, listed as do-not-use) and on `session-timeline` (weekly, exact timestamps). The safe part is per-book totals from `/reading-history?bookId=` (`startedOn`, `endedOn`, `sessions`, `seconds`, `progressPercent`, `rating`, `pageCount`). A timeline would need a Worker that walks `session-timeline` week by week and publishes daily totals only; that is optional and costly.
7. The ETA wording ("~18 days left") is derived, not a field.
8. Anything shown as "paused" maps to `readStatus.status = on_hold`; "listening" has no status value of its own.
9. The OG card as an image. discovery.md covers the numbers and thumbnails, not how a PNG is produced. Options (pre-render at build time, or render in the Worker) are open.
10. Year-ago "this time last year" strip from the reference app: deliberately not designed.

## 11. What the Worker must strip

Principle: explicit allow-list per route, never forward raw JSON. Cover requests go through the Worker so the BookOrbit host and key are never exposed.

| Route | Keep | Strip / never forward |
|---|---|---|
| `/reading-history` | `title`, `authors`, `seriesName`, `seriesIndex`, `format`, `pageCount`, `startedOn`, `endedOn`, `progressPercent`, `sessions`, `seconds`, `rating`, `coverVersion`, `bookId` (only to build opaque cover keys) | `id` (attempt id), `sources`, `removedAt`, `highlightCount`, `journalCount`, `readNumber` / `completedReads` unless shown. Decide on `rating` (personal). Never call `/reading-history/:id/marks` |
| `/reading-history/summary` | `years`, `reads`, `books`, `rereads`, `pages`, `seconds`, `daysRead`, `averageRating`, `months`, `formats`, `goal`, `outcomes` if shown | `sources`. `records` only if used |
| `/user-statistics/summary` | all five fields | none |
| `/user-statistics/daily-reading` | `day`, `readingSeconds` | `progressDelta` / `eventsCount` unless shown |
| `/user-statistics/reading-heatmap` | `day`, `readingSeconds` | `bySource` (reveals devices and apps) |
| `/user-statistics/peak-hours` | `hour`, `readingSeconds`, optionally `byFormat` | `bySource`, `eventsCount`. Consider coarser buckets than hourly (a daily routine is personal) |
| `/user-statistics/favorite-days` | `dayOfWeek`, `readingSeconds`, optionally `byFormat` | `bySource`, `eventsCount` |
| `/user-statistics/goal-trajectory` | `points` | none; pass `goalBooks` yourself |
| `/user-statistics/progress-funnel` | `current` (and `previous` if used) | none |
| `/user-statistics/reading-pace` | aggregate only (mean session length) | per-session points, `bucket` |
| `/dashboard/scrollers/continue-reading` | `title`, `authors`, `seriesName`, `seriesIndex`, `readingProgress`, `readStatus.status`, `readStatus.startedAt`, `pageCount`, `coverVersion`, `hasCover`, an opaque cover key, a file `format` label | `files` (other than the format label), `libraryId`, `tags`, `customMetadata`, `lockedFields`, `metadataScore`, `hardcoverId`, `isbn13`, `publisher`, and every field not in the allow-list |
| `/books/:id/thumbnail`, `/books/:id/cover` | image bytes, `t` = `coverVersion` | upstream headers other than cache headers; never expose the host or key |
| `/auth/me` | nothing public. Server-side health check only (`authenticationMethod === "api_key"`, empty `permissions`) | `email`, `id`, `username`, `settings` entirely. Take only a goal number from `settings.dashboardConfig.readingGoal` if needed |

Do not call: `/books/:id` (server file paths, `personalNote`), `/books/:bookId/sessions` (device names), `/annotations/*`, `/reading-history/:id/marks`, `PATCH /session-timeline/:sessionId`, the App Attest routes, or `POST /dashboard/widgets/batch`. `session-timeline` is the most sensitive route (exact session times and book ids); the design does not need it.

Privacy decisions that change the design (from discovery.md open questions): exact times (the "when I read" chart is hour-level), device/source split (not designed), ratings (stars on hover and book page), abandoned books (not shown; `outcomes` defaults to completed).

## 12. Production notes

- A page at `/reading/` would extend `base.html`. The shell, headings, empty states and skeletons are static HTML; JS fills the numbers.
- Empty and error states are not yet designed: show the shell with `--` values and a `// offline` note in `--dim`.
- The sample's JS (`assets/reading.js`) renders from `RJ.get(year)`; the Worker responses should be adapted into that same shape (`totals`, `books`, `current`, `days`, `months`, `hoursR`, `hoursL`, `dowR`, `dowL`, `goals`, `trajectory`, `funnel`) so the rendering code carries over.
