/*
 * Shared EXAMPLE data + placeholder-cover generator for the reading journal
 * design samples. Everything here is made up; no API, no network.
 */
(function () {
  'use strict';

  var TODAY = new Date(Date.UTC(2026, 10, 25));
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function int(n) { return Math.round(n).toLocaleString('en-US'); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function parseDate(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function isoDate(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function longDate(s) { var d = parseDate(s); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function hm(min) { var h = Math.floor(min / 60), m = Math.round(min % 60); return h + ':' + pad(m); }

  /* ---------- books (EXAMPLE DATA) ---------- */
  // [title, author, kind, size(pages | hours), rating, finished]
  var RAW = [
    ['The Left Hand of Darkness', 'Ursula K. Le Guin', 'read', 304, 5, '2026-01-09'],
    ["Harry Potter and the Philosopher's Stone", 'J.K. Rowling', 'listen', 8.6, 5, '2026-01-17'],
    ['Piranesi', 'Susanna Clarke', 'read', 272, 5, '2026-01-28'],
    ['Project Hail Mary', 'Andy Weir', 'read', 476, 4.5, '2026-02-10'],
    ['Full Moon Coffee Shop', 'Mai Mochizuki', 'read', 304, 4, '2026-02-22'],
    ['Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 'listen', 9.7, 4.5, '2026-02-27'],
    ['The Name of the Wind', 'Patrick Rothfuss', 'read', 662, 4, '2026-03-19'],
    ['Convenience Store Woman', 'Sayaka Murata', 'read', 163, 4.5, '2026-03-24'],
    ['Klara and the Sun', 'Kazuo Ishiguro', 'read', 303, 4, '2026-03-31'],
    ['A Memory Called Empire', 'Arkady Martine', 'read', 462, 4.5, '2026-04-12'],
    ['Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 'listen', 12.1, 5, '2026-04-20'],
    ['Braiding Sweetgrass', 'Robin Wall Kimmerer', 'read', 391, 5, '2026-04-29'],
    ['In Other Rooms, Other Wonders', 'Daniyal Mueenuddin', 'read', 256, 4, '2026-05-11'],
    ['Station Eleven', 'Emily St. John Mandel', 'read', 333, 4.5, '2026-05-23'],
    ['Exhalation', 'Ted Chiang', 'read', 350, 5, '2026-05-30'],
    ['Hyperion', 'Dan Simmons', 'read', 482, 3.5, '2026-06-21'],
    ['The Remains of the Day', 'Kazuo Ishiguro', 'read', 258, 4.5, '2026-06-29'],
    ['The Way of Kings', 'Brandon Sanderson', 'read', 1007, 5, '2026-07-14'],
    ['Spinning Silver', 'Naomi Novik', 'read', 465, 4, '2026-07-30'],
    ['Harry Potter and the Goblet of Fire', 'J.K. Rowling', 'listen', 19.8, 4.5, '2026-08-09'],
    ['Circe', 'Madeline Miller', 'read', 393, 4.5, '2026-08-18'],
    ['The Dispossessed', 'Ursula K. Le Guin', 'read', 387, 4.5, '2026-08-27'],
    ['Kafka on the Shore', 'Haruki Murakami', 'read', 467, 4, '2026-09-08'],
    ['Babel', 'R.F. Kuang', 'read', 545, 4, '2026-09-19'],
    ['The Hobbit', 'J.R.R. Tolkien', 'listen', 11, 5, '2026-09-26'],
    ['Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'read', 416, 4.5, '2026-10-06'],
    ['Dune', 'Frank Herbert', 'listen', 21, 5, '2026-10-16'],
    ['The Ministry for the Future', 'Kim Stanley Robinson', 'read', 563, 3.5, '2026-10-28'],
    ['Before the Coffee Gets Cold', 'Toshikazu Kawaguchi', 'read', 213, 4, '2026-11-04'],
    ['All Systems Red', 'Martha Wells', 'read', 144, 4.5, '2026-11-19'],

    ['Dune Messiah', 'Frank Herbert', 'read', 331, 3.5, '2025-01-12'],
    ['The Fellowship of the Ring', 'J.R.R. Tolkien', 'read', 423, 5, '2025-01-30'],
    ['Flowers for Algernon', 'Daniel Keyes', 'read', 311, 4.5, '2025-02-08'],
    ['Neuromancer', 'William Gibson', 'read', 271, 3.5, '2025-02-21'],
    ['The Lies of Locke Lamora', 'Scott Lynch', 'read', 752, 4.5, '2025-03-17'],
    ['Never Let Me Go', 'Kazuo Ishiguro', 'read', 288, 4.5, '2025-03-28'],
    ['The Martian', 'Andy Weir', 'read', 369, 4.5, '2025-04-09'],
    ['Mistborn: The Final Empire', 'Brandon Sanderson', 'read', 541, 4.5, '2025-05-14'],
    ['Sapiens', 'Yuval Noah Harari', 'listen', 15.5, 4, '2025-05-30'],
    ['The Road', 'Cormac McCarthy', 'read', 287, 4, '2025-06-10'],
    ['Solaris', 'Stanisław Lem', 'read', 204, 4, '2025-06-24'],
    ['The Three-Body Problem', 'Liu Cixin', 'read', 400, 4, '2025-07-15'],
    ['The Midnight Library', 'Matt Haig', 'listen', 8.8, 3.5, '2025-07-29'],
    ['Pachinko', 'Min Jin Lee', 'read', 496, 4.5, '2025-08-19'],
    ['Anxious People', 'Fredrik Backman', 'read', 336, 4, '2025-09-02'],
    ["The Hitchhiker's Guide to the Galaxy", 'Douglas Adams', 'listen', 5.5, 5, '2025-09-14'],
    ['Gideon the Ninth', 'Tamsyn Muir', 'read', 448, 4, '2025-10-03'],
    ['Atomic Habits', 'James Clear', 'listen', 5.6, 3.5, '2025-10-12'],
    ['Rendezvous with Rama', 'Arthur C. Clarke', 'read', 243, 4, '2025-10-22'],
    ['The Secret History', 'Donna Tartt', 'read', 559, 4.5, '2025-11-18'],
    ['Small Things Like These', 'Claire Keegan', 'read', 116, 4.5, '2025-11-30'],
    ['A Psalm for the Wild-Built', 'Becky Chambers', 'read', 160, 5, '2025-12-14']
  ];

  var BOOKS = RAW.map(function (r) {
    var b = {
      title: r[0], author: r[1], kind: r[2], rating: r[4], finished: r[5],
      slug: slug(r[0]), status: 'finished'
    };
    if (r[2] === 'read') b.pages = r[3]; else b.hours = r[3];
    return b;
  });

  var CURRENT = [
    { title: 'Words of Radiance', author: 'Brandon Sanderson', kind: 'read', pages: 1087, pct: 38, status: 'reading' },
    { title: 'Harry Potter and the Order of the Phoenix', author: 'J.K. Rowling', kind: 'listen', hours: 25.7, pct: 64, status: 'listening' },
    { title: 'The Fifth Season', author: 'N.K. Jemisin', kind: 'read', pages: 468, pct: 12, status: 'reading' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', kind: 'read', pages: 499, pct: 41, status: 'paused' }
  ].map(function (b) { b.slug = slug(b.title); return b; });

  // BookOrbit-shaped: /reading-history/summary -> goal{target, reached, metOn}. Titles are the only goal BookOrbit holds.
  var GOALS = { 2026: { books: 32 }, 2025: { books: 24 } };

  /* ---------- derived stats ---------- */
  var HOUR_READ = [3, 1, 0.5, 0.2, 0.2, 0.6, 2, 5, 3.5, 2, 2, 3, 4.5, 3.5, 2.5, 2.5, 3, 4, 5, 6, 8, 10.5, 12, 7];
  var HOUR_LISTEN = [0.5, 0.2, 0, 0, 0, 0.5, 3, 11, 12, 5, 3, 3, 5, 3, 2.5, 3, 7, 12, 10, 5, 4, 3, 2, 1];
  var DOW_READ = [1.35, 0.85, 0.85, 0.95, 0.9, 1.05, 1.3];
  var DOW_LISTEN = [0.8, 1.2, 1.2, 1.15, 1.15, 1.0, 0.7];

  function norm(arr) { var s = arr.reduce(function (a, b) { return a + b; }, 0); return arr.map(function (v) { return v / s; }); }
  HOUR_READ = norm(HOUR_READ); HOUR_LISTEN = norm(HOUR_LISTEN);

  function goalFor(y, books) {
    var target = GOALS[y].books, ordered = books.slice().sort(function (p, q) { return p.finished < q.finished ? -1 : 1; });
    return { target: target, reached: books.length, metOn: books.length >= target ? ordered[target - 1].finished : null };
  }

  function buildYear(y) {
    var rand = mulberry32(y * 7919 + 13);
    var books = BOOKS.filter(function (b) { return b.finished.indexOf(String(y)) === 0; })
      .sort(function (a, b) { return a.finished < b.finished ? 1 : -1; });
    var current = y === 2026 ? CURRENT : [];
    var pace = y === 2026 ? 44 : 40;

    var pages = 0, listenH = 0, read = 0, listen = 0;
    books.forEach(function (b) { if (b.kind === 'read') { pages += b.pages; read++; } else { listenH += b.hours; listen++; } });
    current.forEach(function (b) { if (b.kind === 'read') pages += b.pages * b.pct / 100; else listenH += b.hours * b.pct / 100; });
    var readMin = pages / pace * 60, listenMin = listenH * 60;

    var start = Date.UTC(y, 0, 1), end = y === 2026 ? TODAY.getTime() : Date.UTC(y, 11, 31);
    var phaseA = rand() * 6, phaseB = rand() * 6;
    var days = [], rawR = 0, rawL = 0, i, t;
    for (t = start; t <= end; t += 864e5) {
      var d = new Date(t), dow = d.getUTCDay(), n = Math.round((t - start) / 864e5);
      var wave = 0.65 + 0.55 * (0.5 + 0.5 * Math.sin(n / 9 + phaseA)) + 0.25 * Math.sin(n / 3.1 + phaseB);
      var tail = y === 2026 && end - t < 38 * 864e5;
      var rOn = tail || rand() < 0.84;
      var r = rOn ? Math.max(0.15, wave) * DOW_READ[dow] * (0.4 + rand() * 1.3) : 0;
      var lOn = rand() < (y === 2026 ? 0.62 : 0.4);
      var l = lOn ? DOW_LISTEN[dow] * (0.4 + rand() * 1.4) : 0;
      rawR += r; rawL += l;
      days.push({ date: isoDate(d), dow: dow, r: r, l: l });
    }
    var sessions = 0, activeDays = 0, listenDays = 0;
    days.forEach(function (d) {
      d.r = d.r / rawR * readMin; d.l = d.l / rawL * listenMin;
      d.p = d.r * pace / 60;
      if (d.r > 0) { activeDays++; sessions += rand() < 0.38 ? 2 : 1; }
      if (d.l > 0) listenDays++;
    });

    var months = [];
    for (i = 0; i < 12; i++) months.push({ label: MONTHS[i], read: 0, listen: 0, pages: 0, listenMin: 0 });
    books.forEach(function (b) { var m = parseDate(b.finished).getUTCMonth(); months[m][b.kind]++; });
    days.forEach(function (d) { var m = +d.date.slice(5, 7) - 1; months[m].pages += d.p; months[m].listenMin += d.l; });
    if (y === 2026) months = months.slice(0, 11);

    var hoursR = HOUR_READ.map(function (v) { return v * readMin; });
    var hoursL = HOUR_LISTEN.map(function (v) { return v * listenMin; });
    var dowR = [0, 0, 0, 0, 0, 0, 0], dowL = [0, 0, 0, 0, 0, 0, 0];
    days.forEach(function (d) { dowR[d.dow] += d.r; dowL[d.dow] += d.l; });

    var longest = 0, run = 0, cur = 0;
    days.forEach(function (d) { if (d.r > 0) { run++; if (run > longest) longest = run; } else run = 0; });
    cur = run;

    var cumul = 0, goalBooks = GOALS[y].books;
    var trajectory = months.map(function (m, i) {
      cumul += m.read + m.listen;
      return { month: i + 1, actualCumulative: cumul, targetCumulative: Math.round(goalBooks * (i + 1) / 12 * 10) / 10 };
    });
    for (i = months.length; i < 12; i++) trajectory.push({ month: i + 1, actualCumulative: null, targetCumulative: Math.round(goalBooks * (i + 1) / 12 * 10) / 10 });
    var funnel = { completed: books.length, reached75: books.length + 1, reached50: books.length + 3, reached25: books.length + 5, started: books.length + 7 + current.length };

    var rated = books.filter(function (b) { return b.rating; });
    var avgRating = rated.reduce(function (a, b) { return a + b.rating; }, 0) / (rated.length || 1);

    return {
      key: String(y), label: String(y), year: y, books: books, current: current, days: days, months: months,
      hoursR: hoursR, hoursL: hoursL, dowR: dowR, dowL: dowL,
      goal: goalFor(y, books), trajectory: trajectory, funnel: funnel,
      totals: {
        titles: books.length, read: read, listen: listen, pages: pages,
        readH: readMin / 60, listenH: listenMin / 60, readMin: readMin, listenMin: listenMin,
        finishedListenH: books.filter(function (b) { return b.kind === 'listen'; }).reduce(function (a, b) { return a + b.hours; }, 0),
        pace: pace, avgSession: readMin / Math.max(1, sessions), avgListenSession: listenMin / Math.max(1, listenDays),
        speed: y === 2026 ? 1.25 : 1.1, longestStreak: longest, streak: cur, activeDays: activeDays, listenDays: listenDays,
        avgRating: avgRating
      }
    };
  }

  var cache = {};
  function get(key) {
    key = String(key);
    if (cache[key]) return cache[key];
    var out;
    if (key === 'all') {
      var a = get(2025), b = get(2026), sum = function (f) { return f(a) + f(b); };
      var days = a.days.concat(b.days);
      var last = days.slice(-371);
      var months = a.months.map(function (m, i) { var c = Object.assign({}, m); c.label = MONTHS[i]; c.year = 2025; return c; })
        .concat(b.months.map(function (m, i) { var c = Object.assign({}, m); c.year = 2026; return c; }));
      var readMin = sum(function (x) { return x.totals.readMin; }), listenMin = sum(function (x) { return x.totals.listenMin; });
      out = {
        key: 'all', label: 'All time', year: null, books: b.books.concat(a.books), current: b.current, days: last, months: months,
        hoursR: a.hoursR.map(function (v, i) { return v + b.hoursR[i]; }), hoursL: a.hoursL.map(function (v, i) { return v + b.hoursL[i]; }),
        dowR: a.dowR.map(function (v, i) { return v + b.dowR[i]; }), dowL: a.dowL.map(function (v, i) { return v + b.dowL[i]; }),
        trajectory: null, funnel: { completed: sum(function (x) { return x.funnel.completed; }), reached75: sum(function (x) { return x.funnel.reached75; }), reached50: sum(function (x) { return x.funnel.reached50; }), reached25: sum(function (x) { return x.funnel.reached25; }), started: sum(function (x) { return x.funnel.started; }) },
        goal: { target: sum(function (x) { return x.goal.target; }), reached: sum(function (x) { return x.goal.reached; }), metOn: null },
        totals: {
          titles: sum(function (x) { return x.totals.titles; }), read: sum(function (x) { return x.totals.read; }), listen: sum(function (x) { return x.totals.listen; }),
          pages: sum(function (x) { return x.totals.pages; }), readH: readMin / 60, listenH: listenMin / 60, readMin: readMin, listenMin: listenMin,
          finishedListenH: sum(function (x) { return x.totals.finishedListenH; }),
          pace: 42, avgSession: (a.totals.avgSession + b.totals.avgSession) / 2, avgListenSession: (a.totals.avgListenSession + b.totals.avgListenSession) / 2,
          speed: 1.2, longestStreak: Math.max(a.totals.longestStreak, b.totals.longestStreak), streak: b.totals.streak,
          activeDays: sum(function (x) { return x.totals.activeDays; }), listenDays: sum(function (x) { return x.totals.listenDays; }),
          avgRating: (a.totals.avgRating * a.totals.titles + b.totals.avgRating * b.totals.titles) / (a.totals.titles + b.totals.titles)
        }
      };
    } else out = buildYear(+key);
    cache[key] = out; return out;
  }

  function eta(b) {
    var rest = 1 - b.pct / 100;
    if (b.status === 'paused') return 'paused';
    var days = b.kind === 'read' ? Math.ceil(b.pages * rest / 38) : Math.ceil(b.hours * rest / 1.3);
    return '~' + days + (days === 1 ? ' day left' : ' days left');
  }

  function find(slugStr) {
    var all = BOOKS.concat(CURRENT);
    for (var i = 0; i < all.length; i++) if (all[i].slug === slugStr) return all[i];
    return null;
  }

  /* ---------- placeholder covers ---------- */
  var TOKYO = ['#7aa2f7', '#bb9af7', '#7dcfff', '#9ece6a', '#e0af68', '#f7768e', '#ff9e64', '#73daca'];
  var coverN = 0;

  function coverTitle(t) {
    return t.replace(/\s*\(.*\)$/, '').replace(/^Harry Potter and the /, 'Harry Potter & the ').replace(/^The Ministry for the Future$/, 'The Ministry for the Future');
  }
  function wrap(text, maxChars) {
    var words = text.split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) {
      if ((cur + ' ' + w).trim().length <= maxChars) cur = (cur + ' ' + w).trim();
      else { if (cur) lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function fit(text, width, charW, maxLines, startSize, minSize) {
    var size = startSize, lines;
    for (; size >= minSize; size -= 1) {
      var maxChars = Math.floor(width / (size * charW));
      lines = wrap(text, maxChars);
      var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
      if (lines.length <= maxLines && longest <= maxChars) return { size: size, lines: lines };
    }
    return { size: minSize, lines: wrap(text, Math.floor(width / (minSize * charW))) };
  }
  function motif(i, c, op) {
    var s = 'fill="none" stroke="' + c + '" stroke-opacity="' + op + '" stroke-width="2"', f = 'fill="' + c + '" fill-opacity="' + op + '"', o = '', k;
    switch (i) {
      case 0: o = '<circle cx="140" cy="215" r="74" ' + f + '/><circle cx="140" cy="215" r="44" ' + s + '/>'; break;
      case 1: for (k = 0; k < 6; k++) o += '<rect x="-4" y="' + (170 + k * 22) + '" width="208" height="' + (4 + k * 2.4) + '" ' + f + '/>'; break;
      case 2: for (k = 0; k < 4; k++) o += '<path d="M' + (40 + k * 14) + ' 300 V ' + (230 - k * 6) + ' a ' + (60 - k * 14) + ' ' + (60 - k * 14) + ' 0 0 1 ' + (120 - k * 28) + ' 0 V 300" ' + s + '/>'; break;
      case 3: for (k = 0; k < 24; k++) o += '<circle cx="' + (30 + (k % 6) * 28) + '" cy="' + (190 + Math.floor(k / 6) * 26) + '" r="' + (3 + (k % 3)) + '" ' + f + '/>'; break;
      case 4: for (k = 0; k < 11; k++) o += '<line x1="100" y1="310" x2="' + (-20 + k * 24) + '" y2="170" ' + s + '/>'; break;
      default: for (k = 1; k < 6; k++) o += '<circle cx="70" cy="240" r="' + (k * 17) + '" ' + s + '/>';
    }
    return o;
  }

  function coverSVG(book) {
    var h = hash(book.title), id = 'cv' + (++coverN), m = h % 6, ci = (h >>> 3) % 8;
    var t = coverTitle(book.title), listen = book.kind === 'listen', out = '', fz, ln, i;
    var author = book.author.length > 22 ? book.author.split(' ').slice(-1)[0] : book.author;
    var head = '<svg class="cover-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder cover: ' + esc(book.title) + '" preserveAspectRatio="xMidYMid slice">';

    {
      var ac = TOKYO[ci];
      fz = fit(t, 150, 0.61, 5, 24, 11);
      out += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2f47"/><stop offset="1" stop-color="#16161e"/></linearGradient></defs>';
      out += '<rect width="200" height="300" fill="url(#' + id + ')"/>' + motif(m, ac, 0.28);
      out += '<rect width="9" height="300" fill="' + ac + '"/><rect x="9" width="2" height="300" fill="#000" fill-opacity=".25"/>';
      out += '<text x="26" y="34" font-size="9" fill="' + ac + '" style="font-family:var(--cover-mono,monospace)" letter-spacing="1.5">' + (listen ? '♪ AUDIO' : '▤ BOOK') + '</text>';
      for (i = 0; i < fz.lines.length; i++) out += '<text x="26" y="' + (68 + i * fz.size * 1.22) + '" font-size="' + fz.size + '" font-weight="700" fill="#c0caf5" style="font-family:var(--cover-mono,monospace)">' + esc(fz.lines[i]) + '</text>';
      out += '<text x="26" y="282" font-size="10" fill="#a9b1d6" style="font-family:var(--cover-mono,monospace)">' + esc(author) + '</text>';
    }
    return head + out + '</svg>';
  }


  /* ---------- per-book detail (EXAMPLE DATA) ---------- */
  function detail(b) {
    var r = mulberry32(hash(b.title) ^ 0x9e37), listen = b.kind === 'listen';
    var size = listen ? b.hours : b.pages;
    var n = Math.max(3, Math.round(listen ? b.hours / (0.8 + r() * 0.8) : b.pages / (26 + r() * 22)));
    var calendarDays = Math.round(n * (1.2 + r() * 0.4));
    var fin = b.finished ? parseDate(b.finished) : TODAY;
    var started = new Date(fin.getTime() - calendarDays * 864e5);
    var minutes = listen ? b.hours * 60 : size / 44 * 60;
    var sessions = n + Math.floor(n * 0.35);
    return {
      days: calendarDays, started: isoDate(started), sessions: sessions,
      seconds: minutes * 60, avgSession: minutes / sessions, perDay: listen ? null : size / calendarDays
    };
  }

  function stars(r) {
    var s = '', i;
    for (i = 1; i <= 5; i++) s += r >= i ? '★' : (r >= i - 0.5 ? '⯨' : '☆');
    return s;
  }

  window.RJ = {
    TODAY: TODAY, MONTHS: MONTHS, DOWS: DOWS, DOW_LONG: DOW_LONG,
    detail: detail, get: get, eta: eta, find: find, coverSVG: coverSVG, coverTitle: coverTitle,
    int: int, pad: pad, esc: esc, hm: hm, longDate: longDate, parseDate: parseDate, stars: stars, slug: slug,
    reduced: function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
    max: function (arr) { return Math.max.apply(null, arr); },
    bookParam: function () { var m = /[?&]b=([^&]+)/.exec(location.search); return m ? decodeURIComponent(m[1]) : 'the-way-of-kings'; }
  };
})();
