# Reading journal: design spec ("Terminal ledger")

Status: design sample, example data only. Nothing here calls an API. This document describes the sample in this folder and how each part would be fed once a Worker exists.

Files: `index.html` (main page), `book.html` (per-book share page, `?b=<slug>`), `og.html` (1200x630 year card, `assets/og.png` is a screenshot of it), `assets/reading.css`, `assets/reading.js`, `assets/book.css`, `assets/book.js`, `assets/og.js`, `assets/data.js` (example data + placeholder-cover generator, to be replaced by Worker responses), `assets/fonts/` (JetBrains Mono, same files as the site).

## 0. Decisions

Naufal reviewed the Terminal ledger, three heatmap treatments and three arrangements, and chose:

- **Heatmap v1** as the only heatmap: year in weeks, 7 minute steps, month labels with hours, best day outlined, hover or tap tooltip with minutes, pages and listening. The other treatments (percentile scale with reading/listening toggle, month blocks with streak markers, split reading/listening cells) and their page were dropped.
- **Layout B**, the dashboard: a main column and a sticky sidebar. The other two arrangements (shelf first with a contents rail, and the single column) were dropped.
- Thick progress bars (now-reading about 1.35rem, goals about 1.9rem, weekdays about 1.35rem, funnel about 1.5rem) and headings only, no descriptive subtitles.
- Pace & sessions stays directly under the heatmap, joined to it as one block.
- **Goals are user-chosen.** Titles come from BookOrbit; every other goal type (pages, hours reading, hours listening, days read, longest streak, average minutes per day) is a target he sets himself on a goal-setting page (`goals.html`). Only picked goals show on the goals card, in the order chosen. Defaults are seeded from `goals.json`. See section 9.
- **Widgets are rearrangeable** in the dashboard (main column and sidebar, each within its own column): drag handle, keyboard, reset, order saved per browser. See section 10.
- **Dropped for lack of a data source:** physical format and genre labels, the per-book quote, the per-book pages-per-day sparkline. `book.html` was reworked so nothing is left empty.
- Pages shown in the heatmap tooltip are an **estimate** (minutes x year pace), not a BookOrbit field. See the data map (section 11) and the gaps list (section 12).

Data sources below come from `discovery.md` (BookOrbit v3.8.0 read-only key). Endpoint paths are relative to `/api/v1`. Nothing is added beyond what that file lists. Where a section has no listed source, it says **No source**.

## 1. Idea

The reading log is another page of the existing site, not a separate app. Same Tokyo Night background, JetBrains Mono at weight 300/700, hairline borders, 2px radii, link colour `#7dcfff`. Terminal vocabulary: a `~/reading $ cat 2026.log` prompt, `##` section headings, `//` stat labels, `$` panel headings, segmented block progress bars. Covers are the only imagery.

Two colours carry meaning everywhere: green `#9ece6a` = read, purple `#bb9af7` = listened. Blue `#7aa2f7` is the neutral accent (active tab, goals not yet met, funnel). Orange `#ff9e64` marks an overshoot (`+14%`) or the favourite weekday. Amber `#e0af68` is for star ratings and the "sample data" tag.

## 2. Layout and section order

Container: `min(100% - 2rem, 78rem)`, centred. The existing site is a 44rem column; the reading page is wider (78rem) because of the dashboard grid, heatmap and cover wall. The mock site header (brand + `posts about reading feed`) is reused so the page sits inside the site chrome. A slim "sample bar" at the very top exists only in the design sample and is removed in production.

Order on desktop (>= 1081px):

| Area | Contents |
|---|---|
| Header | Site brand + nav (`reading` highlighted green) |
| Dashboard toolbar | A right-aligned `reset layout` button above the dashboard (disabled while the order is the default) |
| Hero | Prompt line, `h1` "Reading log" (heading only), year switcher (`2026`, `2025`, `all-time`), 4 headline stat blocks |
| Dashboard, main column (`minmax(0,1fr)`) | Five widgets, default order: **heatmap** (daily reading v1 with **pace & sessions** joined directly under it, one widget), titles per month, goal trajectory, **patterns** ("when I read" beside "favourite days", one widget), progress funnel |
| Dashboard, sidebar (23rem, sticky) | Two widgets, default order: `## now reading` (compact cards), `## goals` (compact rows, with an `edit goals` control) |
| `## shelf` | Filter chips, hover status line, finished covers grouped by month (2 columns of months) |
| `## share` | Year card preview (links to `og.html`), per-book page teaser (links to `book.html`) |
| Footer | Sample-data note (production: "updated N min ago") |

Sidebar behaviour: `position: sticky; top: 0.5rem`, `gap 1.25rem`. Its content is about 900px tall and the main column is about 1650px, so it stays in view while the heatmap and charts scroll past. On viewports shorter than its content it scrolls inside itself (`max-height: calc(100vh - 2rem)`, thin scrollbar) instead of being cut off. The sidebar uses compact variants: now-reading cards show a 3.6rem cover, title, author, bar and percent (the format tagline is hidden), and goal rows put label and value on the first line with the full-width bar below.

Collapse (<= 1080px): the sidebar stops being sticky and the grid becomes a single column. Both wrappers use `display: contents`, so the widgets of both columns become siblings of one flex column. Sidebar widgets get `order: -1`, which puts them first; within each column the DOM order (which is also the saved user order) decides. Default result:

1. now reading, 2. goals, 3. heatmap + pace & sessions, 4. months, 5. goal trajectory, 6. when I read + favourite days, 7. funnel, then shelf and share (which are outside the grid and follow in source order).

On phones a viewer can still reorder sidebar widgets among themselves and main widgets among themselves (not across the two groups).

Further breakpoints:
- <= 860px: headline stats 2 x 2; goal rows keep label + value on the first line with the bar full width below; hour and weekday panels stack; pace tiles 2 across; shelf months in one column; share cards stack.
- <= 520px: smaller shell padding, covers 4.4-5.2rem, months chart 10rem tall, panel padding tightens, the `$` heading prefix and sample-bar title are hidden.
- The heatmap uses fluid columns (`minmax(0, 1fr)`, square cells), so at 1440px the whole year fits without scrolling (about 12px cells). It has a minimum width of 0.7rem per week; below that (phones, narrow windows) it scrolls horizontally inside its panel and starts scrolled to the latest week. Everything else must not scroll sideways. Verified at 390, 820, 1024, 1100, 1280 and 1440px for 2026, 2025 and all-time: no horizontal overflow.

### Headings only

Section and panel headings stand alone. There is no lede under `h1`, no note beside a `##` heading ("4 in progress", "set 1 jan 2026"), no goal sub-labels, no captions under charts, and no read-out sentences. What remains next to a heading is data or a key: stat sub-lines (`24 read, 6 listened`), legends (colour swatches), the hover status line, month-group counts, the heat-calendar total, and `kv` tile numbers.

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

Heat ramp (reading, 7 steps on minutes): `#171926` (none), `#2a4636`, `#35603f`, `#4a7a45`, `#6a9a4c`, `#85b85a`, `#a8e07a`; best-day outline `--hot`. Placeholder cover accents cycle through the Tokyo palette (blue, purple, cyan, green, amber, red, orange, teal). They disappear once real covers are used.

Radius is 2px everywhere (matches the site). Borders are 1px. No shadows except the cover wall (`0 6px 16px -8px rgba(0,0,0,.7)`).

## 5. Components

**Stat block** (`.stat`). Four in a bordered, `--panel` block. Structure: `// label` (0.72rem, `--dim`), value (bold, big), sub line (0.74rem). The sub line carries a coloured split ("24 read, 6 listened"). 2 x 2 on mobile.

**Progress bars** (`.bar`, thick). 1.35rem tall in now-reading cards, 1.9rem in goal rows (was 0.7rem and 0.9rem), 1px border, `--bg-deep` track. The fill is a solid colour; a repeating-gradient overlay cuts it into 20 blocks (each 5%, 2px gaps), which gives the terminal look at any width. Colours: green = read or goal met, purple = listening, blue = goal in progress. Values over 100% fill the bar and show an orange `+N%` instead of the percent.

**Now-reading card** (`.now`). Grid: cover 5.5rem + text column. Text: `reading | listening | paused` in the status colour (no format label: BookOrbit has no physical format), bold title, author, bar, `NN%` left and ETA right. Hover tints the card background to `--panel`. In the sidebar the card is compact: cover 3.6rem and the status line is hidden (the bar colour carries read vs listened; `paused` shows in the percent line).

**Goal row** (`.goal`). Label (no sub-label), 1.9rem segmented bar, value `30 / 32 unit` (bold current), percent or an orange `+N%` overshoot. A goal card lists only the goals the owner picked, in the order chosen. A picked goal with no target for the viewed year shows its value and a `set target` link instead of a bar. With no goals picked the card shows `no goals picked` and the `edit goals` link. The heading carries a small `edit goals` control (1px border, cyan text) that links to `goals.html`; in the real build it is rendered only for the owner. Rows have 1.1rem vertical padding in a full-width card and 0.6rem in the sidebar. The goal-trajectory panel (`.traj`, in the main column under the months chart) is an SVG line chart 10rem tall: dashed blue = straight-line target pace, solid green = cumulative titles finished, month axis `jan..dec`. No prose read-out.

**Drag handle** (`.grip`). A small bordered `::` button at the right end of a widget's heading (after the legend or the `edit goals` control): mono bold, `--dim`, 1px `--line` border, 2px radius; hover, focus and drag turn it blue; `cursor: grab`; `touch-action: none` so a finger on the handle drags instead of scrolling. It is the only drag start point, so the rest of every widget scrolls and selects normally.

**Cover wall** (`.wall`). Grid `repeat(auto-fill, minmax(5.6rem, 6.6rem))`, gap 0.75rem (0.55rem on phones). Covers are 2:3 with a 1px border. A 3px bar at the bottom edge marks the kind (green read, purple listened). Hover or keyboard focus lifts the cover 4px, turns its border blue and writes `title . author . finished date . stars` into the status line above the wall (no tooltip, no popover). Touch has no hover; a tap navigates straight to the book page. Click or Enter opens `book.html?b=<slug>`. The chips dim non-matching covers to 14% opacity rather than removing them, so the layout never jumps. Months are headed `nov 2026` with `2 read . 1 heard` (a count, not a blurb). Each cover links to the per-book page. Production covers are the 400x600 thumbnails in the same 2:3 box (the placeholder's left spine and title text are part of the placeholder, not the layout).

**Heat calendar, v1** (`.heat`). Year in weeks: 7 rows (Sun to Sat), one column per week, square cells (fluid, minimum 0.7rem), 3px gap, 2px radius, empty-cell colour `#171926` (darker than the panel so zero days still show). Month names sit above the first week of each month with that month's hours read underneath (`jul` / `26 h`); `mon wed fri` row labels on the left. Seven steps on **fixed minute thresholds** (so a 90-minute day looks the same in any year): none, 1-14, 15-29, 30-44, 45-59, 60-89, 90+ minutes, in ramp `#171926`, `#2a4636`, `#35603f`, `#4a7a45`, `#6a9a4c`, `#85b85a`, `#a8e07a`. The best day of the view has a 2px orange outline and is named in the panel heading (`best day 1 Feb . 2:14 h`). Days after today (current year only) are dashed outlines. Legend row: `minutes 0 1+ 15 30 45 60 90+` swatches plus a `best day` marker. There is no reading/listening toggle.

Tooltip (`.tip`): a small floating box (`#0f1019`, 1px blue border) that follows the pointer on hover and opens on tap for touch (tap again to close). Content: weekday and date, `NN min read . ~NN pages`, and `NN min heard` when there was listening. **Pages are an estimate** (minutes x the year's pages-per-hour pace), hence the `~`. Cells are not individually focusable (a year has 365), so the tooltip is pointer and touch only.

**Charts.**
- Titles per month: one column per month, stacked read (bottom) + listened (top), count above, month name below, current month label in blue. Max column height 150px. All-time view uses 23 narrow columns with initials.
- When I read: 24 columns (one per hour), stacked read + listened, peak hour brightened, ticks at `00 06 12 18 23`. No caption.
- Favourite days: seven rows Mon to Sun: weekday, stacked bar (1.35rem) scaled to the busiest day, hours. The top weekday label is orange. No caption.
- Pace and sessions: six `kv` tiles in a 3 x 2 grid (2 x 3 on mobile): average reading session (min), reading pace (pages/h), listening speed, current streak, longest streak, average rating. The panel sits directly under the heatmap panel (`panel-attached`: -1px margin, dashed top border) so the two read as one block, in the main column and in the stacked mobile order. Tile sub-lines are kept only where they carry a number.
- Progress funnel: five rows (`started`, `reached 25%`, `reached 50%`, `reached 75%`, `completed`), 1.5rem bars scaled to `started`, count and percent. Last row green, others blue.

**Chips and toggles** (`.chips button`, `.switch button`). 1px border, 2px radius, mono 0.72-0.85rem. Active = blue text with blue border (chips) or solid blue fill with dark text (year switcher).

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
| Widget moved | a 0.9s blue ring fades out around the moved widget (no-preference only). Reduced motion gets the new order and the announcement, no ring |

Only `transform` and `opacity` are animated (plus `clip-path` once). Nothing loops except the cursor.

## 7. Per-book share page (`book.html`)

Route in production would be `/reading/books/<slug>`. The page uses the same dashboard grid as the main page so the two feel like one product: a main column (`minmax(0,1fr)`) and a 23rem sticky sidebar. Everything on it has a source in the data map; there is no genre, format label, quote or sparkline.

Finished book (from one `/reading-history` attempt):
- Main column: prompt line `~/reading/2026 $ open the-way-of-kings`, title (`h1`), `author . stars`, a fact grid, and a thick-bar panel `vs your 2026 average`.
- Facts, 8 cells for a book (finished, started, time to finish, sessions, time spent, avg session, pages, pages/day) and 6 for an audiobook (no page count); the grid is 4 across for 8 cells, 3 across for 6 and 3 for in-progress pages, so there is never a hole. 2 across at <= 520px.
- Comparison panel: three 1.35rem bars (days to finish, sessions, time spent). Fill = this book, white tick = the average of that year's finished books, value text `32 d . avg 15 d`. The averages come from the same history list.

In-progress book (from `continue-reading`): facts are progress %, started, days reading (or listening) and, for books, pages; the panel is one thick progress bar with the ETA in its heading. No sessions or time spent, because `continue-reading` does not carry them.

Sidebar: cover (max 16rem, with a `read` / `listened` badge), actions (`copy link`, `year card`, `all books`), and a "link preview" box that imitates a chat unfurl (cover + title + stars + author + date + URL).

Collapse (<= 1080px): single column ordered cover (11rem), title, facts, comparison panel, actions, link preview.

`<meta og:*>` for this page would point at a per-book image, not the year card.

## 8. Year OG card (`og.html`, 1200x630)

Fixed 1200x630 canvas, Tokyo Night background with two faint radial glows. Left: prompt `~/reading $ cat 2026.log`, the year at 150px bold (-8px tracking), `reading log` in blue, then three stats (titles in green, pages in white, hours in purple) with labels. Right: 4 x 2 grid of eight covers. Footer: `abijango / reading` and the domain. A 10px three-colour strip (green / purple / blue) closes the bottom edge. A `sample data` tag sits top right (removed in production). `og.html?raw` renders at exact size for screenshotting; without `raw` it scales down to fit narrow viewports. Safe area: keep text 56-64px from the edges so crops by chat apps do not cut it.

## 9. Goals

### Which goals exist

| Goal type | Unit | Where the value comes from | Target comes from |
|---|---|---|---|
| Titles finished | titles | `/reading-history/summary` -> `goal.reached` (or `books`) | **BookOrbit** (`goal.target`; the same number feeds `goal-trajectory` `goalBooks`). Read-only on the goal page, tagged `synced from BookOrbit` |
| Pages | pages | `/reading-history/summary` -> `pages` | site config |
| Hours reading | h | `/reading-history/summary` -> `seconds` / 3600 | site config |
| Hours listening | h | `/reading-history/summary` -> `formats[]` seconds (only if audio is a format, see gaps) | site config |
| Days read | days | `/reading-history/summary` -> `daysRead` (or `daily-reading` days with `readingSeconds` > 0) | site config |
| Longest streak | days | derived from `daily-reading` (longest run of `readingSeconds` > 0) | site config |
| Avg minutes per day | min | derived: reading seconds / calendar days elapsed in the period (`summary.seconds`, or the mean of `daily-reading`) | site config |

All periods are one year. Targets are stored per year (`2026`, `2025`). In the all-time view a target is the sum of the yearly targets (days, pages, hours, titles), the maximum (longest streak) or the mean (average minutes per day); if any year has no target the row shows `set target`.

### Config and seed

`goals.json` is the seed: the default picked goals (in order) and the yearly targets for the non-BookOrbit goals.

```json
{ "version": 1, "period": "year",
  "enabled": ["titles", "pages", "hoursReading", "hoursListening"],
  "targets": { "pages": { "2026": 9000, "2025": 7000 }, "hoursReading": { "2026": 250 }, "...": {} } }
```

Titles never appear under `targets`. `assets/goals-store.js` (`RG`) holds the goal type definitions, loads `goals.json` over HTTP, and falls back to an identical embedded copy when the page is opened from `file://` (browsers block `fetch` there). If you change one, change both; a test compares them.

### Goal-setting page (`goals.html`)

Owner-only in the real build. Same shell and header as the reading log, prompt `~/reading $ edit goals`, year switcher (`2026`, `2025`) that selects which year's targets are edited, a `<- reading log` link, a `saved` flash and `reset to defaults`.

- Dashboard grid like the main page: main column and a sticky `## goals` preview (the real goals card, thick bars, updating as you type); below 1080px the preview moves above the editor.
- `## picked`: the picked goals in the order chosen. Each row: a terminal switch (`[x]`), the goal name, a target input with its unit, a `per year` tag, the position number and up/down buttons.
- `## menu`: the goal types not picked, each with `[ ]`, its target input (so it can be prefilled) and the `per year` tag. Toggling a goal on appends it to the end of the picked list; toggling off sends it back to the menu. Titles carries the `synced from BookOrbit` tag and a disabled input showing BookOrbit's target.
- Changes save immediately; there is no save button. Empty or negative targets are treated as "not set".
- Rows go two-line at <= 760px (name and position on top, input and tag below).

### Where it is stored

- **Sample:** `localStorage` key `reading.goals.v1` holds `{ enabled: [...], targets: { id: { year: n } } }`, merged over the seed. Resetting deletes the key.
- **Real build:** the same JSON would be saved server-side through the Worker (KV), behind owner-only authentication, for example Cloudflare Access in front of `goals.html` and the write route. **Cloudflare Access needs Naufal's OK before it is set up.** The public page would read the saved goals from the Worker and show the `edit goals` control only to the owner. The widget order (section 10) could optionally be saved in the same KV record instead of per browser, so every visitor sees his arrangement, or kept per visitor; that is a product choice.
- No BookOrbit write is involved: BookOrbit's goal is read through the key and never edited from this site.

## 10. Interaction

- **Cover hover or focus:** lift 4px, blue border, status line above the shelf updates with title, author, finished date and stars. Non-matching covers dim to 14% when a chip filter is on.
- **Cover click or tap, or a now-reading card:** goes to the per-book page for that title (`book.html?b=<slug>`). The page is described in section 7. In production the slug would map to an opaque key for one `bookId`.
- **Heat calendar tooltip:** floating tooltip on hover, tap to open and close on touch (see components). Cells are not individually focusable (a year has 365), so the tooltip is pointer and touch only; keyboard users get the monthly hours in the month labels.
- **Goals card:** `edit goals` opens `goals.html`. Coming back (including from the back/forward cache) re-reads the saved goals.

### Rearranging widgets

Every dashboard widget has a `::` handle. Widgets are: main column `heat` (heatmap + pace & sessions together), `months`, `traj`, `patterns` (hours + weekdays together), `funnel`; sidebar `now`, `goals`. A widget moves only within its own column.

- **Pointer and touch:** press the handle and drag (Pointer Events with pointer capture, so mouse, pen and finger behave the same). The dragged widget dims with a dashed blue outline; a 3px blue line shows the drop position (before or after the nearest widget in that column); the page auto-scrolls near the top and bottom edges; releasing drops it. `Escape` cancels. On touch the handle has `touch-action: none`, so no long-press is needed: touching the handle drags, touching anything else scrolls.
- **Keyboard:** focus the handle and press ArrowUp or ArrowDown to move the widget one place; focus stays on the handle. A visually hidden live region announces `titles per month moved to position 1 of 5.` (and `... already first.` at the ends). The handle has `aria-label`, `aria-keyshortcuts` and a title.
- **Reset layout:** the button above the dashboard restores the default order and clears storage. It is disabled while the layout is the default.
- **Persistence:** `localStorage` key `reading.layout.v1` = `{ "main": [ids], "side": [ids] }`. The key is removed when the order equals the default, unknown ids are ignored and new widgets are appended, so adding a widget later does not break saved layouts. The order is applied on load before the first render of the widgets' contents. Real build: per browser, or optionally in the Worker's KV with the goals (see section 9).
- **Reduced motion:** no ring animation, no transitions; the drop still happens and is announced.
- **Mobile:** works with the handle (tested with synthetic touch events). Sidebar widgets sort among themselves, main widgets among themselves; the two groups are not interleaved. The handles are added by script.

## 11. Data map

Assumptions behind every row: one read-only BookOrbit key (Access Read, no permissions, only the libraries meant to be public). The Worker never passes BookOrbit responses through; each route returns a fixed allow-list of fields. `days` windows on the `user-statistics` routes count back from today, so a past year needs a large `days` plus filtering by `day` in the Worker. `reading-history` and its summary take `year` directly.

| Design section | Sample field | Source (discovery.md) | Notes |
|---|---|---|---|
| Year switcher | `2026`, `2025`, `all-time` | `GET /reading-history/summary` -> `years[]` | `all-time` = no `year` param and `days=3650` on the stats routes |
| Hero: titles finished | `totals.titles` | `GET /reading-history/summary` -> `books` (and `reads`, `rereads`) | `year` param. All-time can also use `GET /user-statistics/summary` -> `completedBooks` |
| Hero: pages read | `totals.pages` | `/reading-history/summary` -> `pages` | |
| Hero: hours reading | `totals.readH` | `/reading-history/summary` -> `seconds` / 3600 | See audio caveat in section 12 |
| Hero: hours listening | `totals.listenH` | **Possibly** `/reading-history/summary` -> `formats[]` (per-format seconds) | Only if audiobooks are a BookOrbit format. discovery.md does not list format values. Otherwise **No source** |
| Hero sub-lines: reading days | `activeDays` | `/reading-history/summary` -> `daysRead` | Or count `daily-reading` days with `readingSeconds > 0` |
| Hero sub-line: listening days | `listenDays` | **No source** | No per-format daily data in discovery.md |
| Hero sub-line: "about N per book" | derived | `pages / books` | Computed client-side |
| Now reading: list, `N in progress` | `current[]` | `GET /dashboard/scrollers/continue-reading` (`limit` <= 50) -> `books`, `total`. `GET /user-statistics/summary` -> `inProgressBooks` for the all-time count | A scroller, so it works with a key. Alternative: `POST /books/query` with `readStatus includesAny [reading, rereading]` |
| Now reading: title, author | | `continue-reading` -> `title`, `authors` | |
| Now reading: percent | `pct` | `continue-reading` -> `readingProgress` | |
| Now reading: status (reading / paused) | `status` | `continue-reading` -> `readStatus.status` (`reading`, `rereading`, `on_hold`) | `listening` is **No source** unless the format is audio (see section 12). `abandoned` is never shown |
| Now reading: ETA "~18 days left" | `eta` | derived: `pageCount`, `readingProgress`, pace from `reading-pace` | Computed in the Worker. `pageCount` is on BookCard |
| Now reading: cover | | `GET /books/:id/thumbnail?t=<coverVersion>` | Proxied; see section 13 |
| Goals card: titles | `goal.reached` / `goal.target` | `/reading-history/summary` -> `goal{target, reached, metOn}` | The one goal BookOrbit holds. `metOn` can drive a "goal met on 14 oct" note |
| Goals card: pages, hours reading, hours listening, days read | `totals.*` | `/reading-history/summary` -> `pages`, `seconds`, `formats[]`, `daysRead` | Values from BookOrbit. **Targets are not BookOrbit data**: they come from the site's goal config (section 9). Hours listening carries the audio caveat |
| Goals card: longest streak, average minutes per day | derived | `daily-reading` (`readingSeconds`) or `summary.seconds` / days elapsed | Targets from the goal config |
| Goals card: which goals show, in what order | `enabled[]` | **Not BookOrbit**: owner's goal config (seed `goals.json`, saved by the Worker in KV in the real build) | See section 9 |
| Goal trajectory | `trajectory[]` | `GET /user-statistics/goal-trajectory` -> `points[{year, month, actualCumulative, targetCumulative}]` | Pass `goalBooks` explicitly (it defaults to 12 and does not read the user's goal). Take the number from `/reading-history/summary.goal.target` |
| Shelf: covers, titles, authors | `books[]` | `GET /reading-history` (`year`, `outcomes=completed`, `sort=newest`, `limit` <= 200) -> `title`, `authors[]`, `bookId`, `endedOn`, `rating`, `format`, `coverVersion` | |
| Shelf: month groups | | `endedOn` grouped client-side, or `/reading-history/summary` -> `months[]` | `months[]` item shape is not specified in discovery.md |
| Shelf: read / listened chips and edge colour | `kind` | `/reading-history` -> `format` | Same audio caveat. If audiobooks are not distinct, remove the chips and the purple edge |
| Shelf: hover line stars | `rating` | `/reading-history` -> `rating` | Personal data, privacy decision pending |
| Titles per month | `months[]` | `/reading-history/summary` -> `months[]`, or count `/reading-history` items by `endedOn` month | Read/listened stack depends on format |
| Heat calendar: cells and the month-hours labels | `days[].r` | `GET /user-statistics/reading-heatmap` -> `[{day, readingSeconds, progressDelta, eventsCount}]` | Or `daily-reading` (same shape, cheaper). Worker drops `bySource`. Month hours = sum of `readingSeconds` per month, client side. For a past year, request a large `days` and filter by `day` |
| Heat tooltip: minutes read | `days[].r` | same rows, `readingSeconds` / 60 | |
| Heat tooltip: "~N pages" | `days[].p` | **Estimate only**: `readingSeconds` x the year's pace (pages/h from `/reading-history/summary`: `pages` / (`seconds` / 3600)) | `daily-reading` and `reading-heatmap` give `progressDelta` (a percentage of a book) and no page count, and there is no per-day book id to join `pageCount`. The tooltip shows `~` before the number; the alternative is to drop pages from the tooltip |
| Heat tooltip: "min heard" | `days[].l` | **No source** | `bySource` is app/device, not listening. Remove the line unless per-format daily data exists |
| Heat best day (outline + heading) | derived | max `readingSeconds` in the view from `daily-reading` | Computed client side; no extra endpoint |
| Pace: average reading session | `avgSession` | `GET /user-statistics/reading-pace` -> mean `durationSeconds` | One point per session. Drop `bucket` |
| Pace: reading pace (pages/h) | `pace` | derived: `/reading-history/summary` `pages` / (`seconds` / 3600) | `reading-pace` has `progressDelta` but no page count, so use the history totals |
| Pace: listening speed (1.25x), average listening session | | **No source** | |
| Pace: current and longest streak | `streak`, `longestStreak` | derived from `daily-reading` (`readingSeconds > 0`) | discovery.md names `daily-reading` the cheapest base for streaks |
| Pace: average rating | `avgRating` | `/reading-history/summary` -> `averageRating` | |
| Progress funnel | `funnel` | `GET /user-statistics/progress-funnel` -> `current{started, reached25, reached50, reached75, completed}` | `previous` could add a "vs last period" delta; not designed |
| Share: year card numbers | | same as hero | |
| Share: year card covers | 8 covers | `/reading-history` items + thumbnails | Pick by rating or recency in the Worker |
| Book page: title, author, stars | | `/reading-history?bookId=` -> `title`, `authors`, `rating` | |
| Book page: finished, started, time to finish | | `endedOn`, `startedOn` (days between) | |
| Book page: sessions, time spent, avg session | | `sessions`, `seconds` (avg = `seconds` / `sessions`) | Finished attempts only |
| Book page: pages, pages/day | | `pageCount`; pages/day = `pageCount` / days to finish | Books only |
| Book page: vs your year averages | | the same list for that year: mean of days, `sessions`, `seconds` | Computed client side from `/reading-history` (`year`, up to 200 items) |
| Book page (in progress): progress, started, days, pages | | `continue-reading` -> `readingProgress`, `readStatus.startedAt`, `pageCount` | No sessions or time spent for in-progress books |
| Footer "updated N min ago" | | Worker cache timestamp | Not BookOrbit data |

## 12. Things the design shows that have no (confirmed) source

1. **Everything that depends on audio being distinct from reading.** The design splits read vs listened in the hero, shelf chips, month chart, hours chart, weekday chart, and goals. discovery.md shows `format` / `byFormat` / `formats[]` fields but never says audiobooks are a value. Confirm against BookOrbit before keeping the split. If audio is not a format, the page collapses to reading only: drop purple, the chips, `Audiobooks` and `Hours listened` goals, and listening tiles.
2. Listening days, listening speed, average listening session, and the "min heard" line in the heat tooltip.
3. Goal targets other than titles are **not BookOrbit data** and not a gap in the design: they live in the site's own goal config (section 9). What remains open is where the real build stores them (Worker KV) and how the owner authenticates (Cloudflare Access, which needs Naufal's OK). The `edit goals` control and `goals.html` do not exist for visitors.
4. Physical format labels ("Paperback", "Full-cast audiobook") and genre: **removed from the design**. BookOrbit has file formats only, and genre lives only on BookCard, not in the history list.
5. The per-book quote: **removed**. Personal notes live only in `/books/:id` (`personalNote`) and in the annotation and marks routes, which discovery.md says not to use.
6. The per-book pages-per-day sparkline: **removed**. Per-book sessions are only on `/books/:bookId/sessions` (carries a KOReader `device`, listed as do-not-use) and on `session-timeline` (weekly, exact timestamps). The book page now uses totals only (sessions, seconds, dates, pages) plus comparisons with the year's averages.
7. The ETA wording ("~18 days left") is derived, not a field.
8. Anything shown as "paused" maps to `readStatus.status = on_hold`; "listening" has no status value of its own.
9. The OG card as an image. discovery.md covers the numbers and thumbnails, not how a PNG is produced. Options (pre-render at build time, or render in the Worker) are open.
10. Year-ago "this time last year" strip from the reference app: deliberately not designed.
11. The heat tooltip's "~N pages" is an estimate, not a field (see data map). The same estimate would apply to any per-day or per-month page figure.
12. The in-progress book page (opened from a now-reading card): `continue-reading` gives progress, `startedAt` and `pageCount`; sessions, time spent and average session exist only for finished attempts in `/reading-history`, so the page shows only the four facts it has and a progress bar.
13. **Hours listening** as a goal and as a stat, and every other read-vs-listened split, still depend on audio being a BookOrbit `format` (item 1).
14. The ETA on in-progress audiobooks: audio duration is not in any listed field, so `~N days left` is only possible for books with `pageCount`.

## 13. What the Worker must strip

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
| `/dashboard/scrollers/continue-reading` | `title`, `authors`, `seriesName`, `seriesIndex`, `readingProgress`, `readStatus.status`, `readStatus.startedAt`, `pageCount`, `coverVersion`, `hasCover`, an opaque cover key | `files` (other than the format label), `libraryId`, `tags`, `customMetadata`, `lockedFields`, `metadataScore`, `hardcoverId`, `isbn13`, `publisher`, and every field not in the allow-list |
| `/books/:id/thumbnail`, `/books/:id/cover` | image bytes, `t` = `coverVersion` | upstream headers other than cache headers; never expose the host or key |
| `/auth/me` | nothing public. Server-side health check only (`authenticationMethod === "api_key"`, empty `permissions`) | `email`, `id`, `username`, `settings` entirely. Take only a goal number from `settings.dashboardConfig.readingGoal` if needed |

Do not call: `/books/:id` (server file paths, `personalNote`), `/books/:bookId/sessions` (device names), `/annotations/*`, `/reading-history/:id/marks`, `PATCH /session-timeline/:sessionId`, the App Attest routes, or `POST /dashboard/widgets/batch`. `session-timeline` is the most sensitive route (exact session times and book ids); the design does not need it.

Privacy decisions that change the design (from discovery.md open questions): exact times (the "when I read" chart is hour-level), device/source split (not designed), ratings (stars on hover and book page), abandoned books (not shown; `outcomes` defaults to completed).

## 14. Production notes

- A page at `/reading/` would extend `base.html`. The shell, headings, empty states and skeletons are static HTML; JS fills the numbers.
- Empty and error states are not yet designed: show the shell with `--` values and a `// offline` note in `--dim`.
- The sample's JS (`assets/reading.js`) renders from `RJ.get(year)`; the Worker responses should be adapted into that same shape (`totals`, `books`, `current`, `days`, `months`, `hoursR`, `hoursL`, `dowR`, `dowL`, `goal`, `trajectory`, `funnel`) so the rendering code carries over.
- Two Worker routes are not BookOrbit proxies: read and write of the owner's goal config (write only behind owner auth), and optionally the saved widget order. Both are small JSON documents in KV. The sample's `assets/goals-store.js` read/write functions are the seam to replace.
- `goals.json` stays in the site repo as the seed; KV overrides it once the owner saves.
