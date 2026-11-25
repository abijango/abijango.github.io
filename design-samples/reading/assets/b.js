(function () {
  'use strict';
  var R = window.RJ, $ = function (id) { return document.getElementById(id); };
  var KEYS = [['2026', '2026'], ['2025', '2025'], ['all', 'All time']];
  var state = { key: '2026', filter: 'all', sort: 'date', cal: null };
  var RING_C = 326.7;

  function href(b) { return 'book-b.html?b=' + b.slug; }
  function cover(b) { return R.coverSVG(b, 'b'); }

  function renderSwitch() {
    $('year-switch').innerHTML = KEYS.map(function (k) { return '<button role="tab" type="button" data-k="' + k[0] + '" aria-selected="' + (k[0] === state.key) + '">' + k[1] + '</button>'; }).join('');
  }

  function renderHead(Y) {
    var t = Y.totals;
    $('yh-year').textContent = Y.key === 'all' ? '2025–26' : Y.key;
    $('yh-sub').textContent = Y.key === '2026' ? 'Still counting: 36 days left. ' + t.titles + ' titles so far, and the stack by the bed has not got smaller.' : Y.key === '2025' ? 'A complete year. ' + t.titles + ' titles, a lot of space opera, one very long thriller of a fantasy.' : 'Two years of the journal so far, ' + t.titles + ' titles and counting.';
    var items = [
      [R.int(t.titles), '', 'Titles finished', '<b class="r">' + t.read + '</b> read · <b class="l-c">' + t.listen + '</b> heard'],
      [R.int(t.pages), '', 'Pages read', '~' + R.int(t.pages / Math.max(1, t.read)) + ' per book'],
      [R.int(t.readH), 'h', 'Hours reading', R.int(t.activeDays) + ' days with a book open'],
      [R.int(t.listenH), 'h', 'Hours listening', R.int(t.listenDays) + ' days with headphones']
    ];
    $('headline').innerHTML = items.map(function (it, i) {
      return '<div class="hs fade" style="--i:' + i + '"><p class="n">' + it[0] + (it[1] ? '<small>' + it[1] + '</small>' : '') + '</p><p class="l">' + it[2] + '</p><p class="d">' + it[3] + '</p></div>';
    }).join('');
  }

  function renderNow(Y) {
    var cur = Y.current;
    if (!cur.length) { $('now').innerHTML = '<p class="note">Nothing in progress in this view. Switch back to 2026 to see the nightstand.</p>'; return; }
    $('now').innerHTML = cur.map(function (b, i) {
      var l = b.kind === 'listen', col = l ? 'var(--lav)' : 'var(--moss)';
      return '<a class="now fade' + (l ? ' listen' : '') + '" style="--i:' + (i + 2) + '" href="' + href(b) + '">' +
        '<span class="cv">' + cover(b) + '</span><span><p class="meta' + (l ? ' l' : '') + '">' + R.esc(b.format) + ' · ' + R.esc(b.genre) + '</p>' +
        '<h3>' + R.esc(b.title) + '</h3><p class="au">' + R.esc(b.author) + '</p>' +
        '<span class="track" role="progressbar" aria-valuenow="' + b.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + R.esc(b.title) + ' progress" style="display:block"><i style="--w:' + b.pct + '%;--c:' + col + ';--i:' + i + '"></i></span>' +
        '<p class="prog"><b>' + b.pct + ' %</b> · ' + R.eta(b) + '</p></span></a>';
    }).join('');
  }

  function renderRings(Y) {
    var rows = R.goalRows(Y), colors = ['var(--moss)', 'var(--amber)', 'var(--lav)', 'var(--teal)'];
    $('goals-k').textContent = Y.key === 'all' ? 'Goals, all years' : 'Yearly goals ' + Y.year;
    $('rings').innerHTML = rows.map(function (g, i) {
      var p = Math.min(100, g.pct), off = RING_C * (1 - p / 100);
      return '<div class="ring fade" style="--i:' + i + '"><svg viewBox="0 0 120 120" role="img" aria-label="' + g.label + ': ' + Math.round(g.pct) + ' percent of goal"><circle class="trk" cx="60" cy="60" r="52"/>' +
        (g.pct > 100 ? '<circle class="over" cx="60" cy="60" r="43" style="--c:' + colors[i] + '"/>' : '') +
        '<circle class="val" cx="60" cy="60" r="52" style="--c:' + colors[i] + ';--off:' + off + ';--i:' + i + '"/><text x="60" y="60">' + Math.round(g.pct) + ' %</text></svg>' +
        '<p class="lab">' + g.label + '</p><p class="fig">' + g.fmt(g.value) + ' / ' + g.fmt(g.goal) + g.unit + '</p></div>';
    }).join('');
    var last7 = Y.days.slice(-7), rm = 0, lm = 0;
    last7.forEach(function (d) { rm += d.r; lm += d.l; });
    $('goals-strip').innerHTML = (Y.key === 'all' ? 'Last 7 days' : 'Last 7 days') + ': reading <b>' + R.hm(rm) + ' h</b> · listening <b>' + R.hm(lm) + ' h</b>' + (Y.key === '2026' ? ' · <b>' + rows.filter(function (g) { return g.pct >= 100; }).length + ' of 4</b> goals reached' : '');
  }

  function renderTiles(Y) {
    var t = Y.totals, tot = t.readH + t.listenH;
    var books = Y.books.filter(function (b) { return b.kind === 'read'; }), au = Y.books.filter(function (b) { return b.kind === 'listen'; });
    function avg(a) { return a.length ? (a.reduce(function (s, b) { return s + b.rating; }, 0) / a.length).toFixed(1) : '–'; }
    var tiles = [
      ['Titles finished', R.int(t.titles), '', null, [['Reading', t.read], ['Listening', t.listen]]],
      ['Hours, together', R.int(tot), '<small>h</small>', t.readH / tot * 100, [['Reading', R.int(t.readH) + ' h'], ['Listening', R.int(t.listenH) + ' h']]],
      ['Average session', Math.round(t.avgSession), '<small>min</small>', null, [['Reading', Math.round(t.avgSession) + ' min'], ['Listening', Math.round(t.avgListenSession) + ' min']]],
      ['Pace', t.pace, '<small>pages / h</small>', null, [['Reading', (function (s) { return Math.floor(s / 60) + ':' + R.pad(s % 60); })(Math.round(3600 / t.pace)) + ' min / page'], ['Listening', t.speed.toFixed(2).replace(/0$/, '') + ' × speed']]],
      ['Average rating', avg(Y.books), '<small>★ of 5</small>', null, [['Books', avg(books) + ' ★'], ['Audiobooks', avg(au) + ' ★']]],
      ['Current streak', t.streak, '<small>days</small>', null, [['Longest run', t.longestStreak + ' days'], ['Days listened', R.int(t.listenDays)]]]
    ];
    $('tiles').innerHTML = tiles.map(function (x, i) {
      return '<div class="tile fade" style="--i:' + i + '"><p class="n">' + x[1] + x[2] + '</p><p class="l">' + x[0] + '</p>' +
        (x[3] != null ? '<div class="mix"><i style="width:' + x[3] + '%;background:var(--moss)"></i><i style="width:' + (100 - x[3]) + '%;background:var(--lav)"></i></div>' : '') +
        '<div class="split"><div><span>' + x[4][0][0] + '</span><b>' + x[4][0][1] + '</b></div><div class="lis"><span>' + x[4][1][0] + '</span><b>' + x[4][1][1] + '</b></div></div></div>';
    }).join('');
  }

  function renderWall(Y) {
    var list = Y.books.slice();
    if (state.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating || (a.finished < b.finished ? 1 : -1); });
    $('shelf-count').textContent = Y.books.length + ' titles';
    $('wall').innerHTML = list.map(function (b, i) {
      var off = state.filter !== 'all' && b.kind !== state.filter;
      return '<a class="fade' + (off ? ' dim' : '') + '" style="--i:' + Math.min(i, 14) + '" data-kind="' + b.kind + '" href="' + href(b) + '" aria-label="' + R.esc(b.title + ', ' + b.author) + '"><span class="cv">' + cover(b) + '</span>' + (b.kind === 'listen' ? '<span class="hp">AUDIO</span>' : '') +
        '<span class="cap"><b>' + R.esc(R.coverTitle(b.title)) + '</b>' + R.esc(b.author) + '<br><span>' + R.stars(b.rating) + '</span></span></a>';
    }).join('');
  }

  function renderMonths(Y) {
    var max = Math.max.apply(null, Y.months.map(function (m) { return m.read + m.listen; })) || 1, dense = Y.months.length > 12, H = 150;
    $('months').innerHTML = '<div class="mchart' + (dense ? ' dense' : '') + '" role="img" aria-label="Titles finished per month">' + Y.months.map(function (m, i) {
      var tot = m.read + m.listen, lb = dense ? m.label.charAt(0) : m.label;
      return '<div class="mc"><span class="v">' + (tot || '') + '</span><div class="st" style="--i:' + i + ';height:' + (tot ? Math.max(6, tot / max * H) : 3) + 'px" title="' + m.label + ': ' + m.read + ' read, ' + m.listen + ' heard">' +
        (m.listen ? '<i class="l" style="height:' + (m.listen / tot * 100) + '%"></i>' : '') + (m.read ? '<i style="height:' + (m.read / tot * 100) + '%"></i>' : '') + (tot ? '' : '<i style="height:100%;background:var(--line-2)"></i>') + '</div><span class="lb">' + lb + '</span></div>';
    }).join('') + '</div>';
  }

  function smooth(vals, w, h, max) {
    var pts = vals.map(function (v, i) { return [i / Math.max(1, vals.length - 1) * w, h - 4 - (v / max) * (h - 12)]; }), d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6) + ',' + (p2[0] - (p3[0] - p1[0]) / 6) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6) + ',' + p2[0] + ' ' + p2[1];
    }
    return { line: d, area: d + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' };
  }
  function renderAreas(Y) {
    var pg = Y.months.map(function (m) { return m.pages; }), mn = Y.months.map(function (m) { return m.listenMin; });
    function one(vals, color, name, total, gid) {
      var p = smooth(vals, 600, 100, R.max(vals) * 1.08);
      return '<div class="a"><span class="nm">' + name + '</span><span class="tot">' + total + '</span><svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".38"/><stop offset="1" stop-color="' + color + '" stop-opacity=".02"/></linearGradient></defs>' +
        '<path d="' + p.area + '" fill="url(#' + gid + ')"/><path d="' + p.line + '" fill="none" stroke="' + color + '" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></div>';
    }
    var labels = Y.months.length > 12 ? [Y.months[0].label + ' ' + Y.months[0].year, 'Dec 2025', Y.months[Y.months.length - 1].label + ' ' + Y.months[Y.months.length - 1].year] : [Y.months[0].label, Y.months[Math.floor(Y.months.length / 2)].label, Y.months[Y.months.length - 1].label];
    $('areas').className = 'areas';
    $('areas').innerHTML = '<div style="padding-top:1.4rem">' + one(pg, '#e0af68', 'Pages read', R.int(Y.totals.pages), 'ga' + Math.random().toString(36).slice(2, 6)) + '</div><div style="padding-top:1.6rem">' + one(mn, '#bb9af7', 'Minutes listened', R.int(Y.totals.listenMin) + ' min', 'gb' + Math.random().toString(36).slice(2, 6)) + '</div><div class="axis"><span>' + labels[0] + '</span><span>' + labels[1] + '</span><span>' + labels[2] + '</span></div>';
  }

  function calRange(Y) {
    var a = R.parseDate(Y.days[0].date), b = R.parseDate(Y.days[Y.days.length - 1].date);
    return { min: a.getUTCFullYear() * 12 + a.getUTCMonth(), max: b.getUTCFullYear() * 12 + b.getUTCMonth(), lastDate: Y.days[Y.days.length - 1].date };
  }
  function renderCal(Y) {
    var rg = calRange(Y);
    if (state.cal == null || state.cal < rg.min || state.cal > rg.max) state.cal = rg.max;
    var y = Math.floor(state.cal / 12), m = state.cal % 12, map = {};
    Y.days.forEach(function (d) { map[d.date] = d; });
    var rq = Y.days.map(function (d) { return d.r; }).filter(Boolean).sort(function (a, b) { return a - b; }), q1 = rq[Math.floor(rq.length * 0.33)], q2 = rq[Math.floor(rq.length * 0.66)];
    var first = new Date(Date.UTC(y, m, 1)), dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), off = (first.getUTCDay() + 6) % 7, h = '', i, sumR = 0, sumL = 0;
    for (i = 0; i < off; i++) h += '<div class="cd out"></div>';
    for (i = 1; i <= dim; i++) {
      var iso = y + '-' + R.pad(m + 1) + '-' + R.pad(i), d = map[iso], style = '', cls = 'cd';
      if (!d) cls += ' fut';
      else {
        sumR += d.r; sumL += d.l;
        var a = d.r <= 0 ? 0 : (d.r < q1 ? 0.28 : d.r < q2 ? 0.5 : 0.78), c1 = 'rgba(158,206,106,' + a + ')', c2 = 'rgba(187,154,247,' + (d.l > 0 ? (d.l < 40 ? 0.35 : 0.7) : 0) + ')';
        if (d.r > 0 && d.l > 0) style = 'background:linear-gradient(135deg,' + c1 + ' 50%,' + c2 + ' 50%)';
        else if (d.r > 0) style = 'background:' + c1; else if (d.l > 0) style = 'background:' + c2;
      }
      if (iso === rg.lastDate && Y.key !== '2025') cls += ' today';
      h += '<div class="' + cls + '" style="--i:' + (off + i) + ';' + style + '" title="' + iso + (d ? ' · ' + Math.round(d.r) + ' min read · ' + Math.round(d.l) + ' min heard' : '') + '">' + i + '</div>';
    }
    $('cal').innerHTML = h;
    $('cal-title').textContent = R.MONTHS[m] + ' ' + y;
    $('cal-sum').textContent = R.hm(sumR) + ' h read · ' + R.hm(sumL) + ' h heard';
    $('cal-prev').disabled = state.cal <= rg.min; $('cal-next').disabled = state.cal >= rg.max;
  }

  function renderClock(Y) {
    var tot = Y.hoursR.map(function (v, i) { return v + Y.hoursL[i]; }), max = R.max(tot), r0 = 50, L = 64, c = 130, s = '', i;
    var peak = tot.indexOf(max), pr = Y.hoursR.indexOf(R.max(Y.hoursR)), pl = Y.hoursL.indexOf(R.max(Y.hoursL));
    s += '<circle class="gr" cx="130" cy="130" r="' + r0 + '"/><circle class="gr" cx="130" cy="130" r="' + (r0 + L) + '" stroke-dasharray="2 4"/>';
    for (i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2 - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), lr = Y.hoursR[i] / max * L, ll = Y.hoursL[i] / max * L;
      s += '<line style="--i:' + i + '" x1="' + (c + ca * r0) + '" y1="' + (c + sa * r0) + '" x2="' + (c + ca * (r0 + lr)) + '" y2="' + (c + sa * (r0 + lr)) + '" stroke="#9ece6a" stroke-width="7" stroke-linecap="butt"/>' +
        '<line style="--i:' + i + '" x1="' + (c + ca * (r0 + lr)) + '" y1="' + (c + sa * (r0 + lr)) + '" x2="' + (c + ca * (r0 + lr + ll)) + '" y2="' + (c + sa * (r0 + lr + ll)) + '" stroke="#bb9af7" stroke-width="7" stroke-linecap="butt"/>';
    }
    [[0, '00'], [6, '06'], [12, '12'], [18, '18']].forEach(function (p) {
      var a = p[0] / 24 * Math.PI * 2 - Math.PI / 2; s += '<text x="' + (c + Math.cos(a) * (r0 + L + 16)) + '" y="' + (c + Math.sin(a) * (r0 + L + 16)) + '">' + p[1] + '</text>';
    });
    s += '<text class="big" x="130" y="124">' + R.pad(peak) + ':00</text><text x="130" y="144">PEAK HOUR</text>';
    $('clock').innerHTML = '<svg viewBox="0 0 260 260" role="img" aria-label="Radial chart of reading and listening by hour of day">' + s + '</svg>';
    $('clock-note').innerHTML = 'Pages come late: reading peaks at <b>' + R.pad(pr) + ':00</b>. Audiobooks belong to the commute, peaking at <b>' + R.pad(pl) + ':00</b>.';
  }

  function renderDows(Y) {
    var tot = Y.dowR.map(function (v, i) { return v + Y.dowL[i]; }), max = R.max(tot), top = tot.indexOf(max);
    $('dows').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d, i) {
      return '<div class="dow' + (d === top ? ' fav' : '') + '"><span class="d">' + R.DOW_LONG[d] + '</span><div class="t"><i style="--w:' + (tot[d] / max * 100) + '%;--i:' + i + '"><b style="width:' + (Y.dowR[d] / tot[d] * 100) + '%"></b><b class="l" style="width:' + (Y.dowL[d] / tot[d] * 100) + '%"></b></i></div><span class="n">' + Math.round(tot[d] / 60) + ' h</span></div>';
    }).join('');
    $('dows-note').innerHTML = '<b>' + R.DOW_LONG[top] + '</b> is the favourite: ' + Math.round(tot[top] / 60) + ' hours with a book or a story, ' + Math.round((tot[top] / (tot.reduce(function (a, b) { return a + b; }, 0) / 7) - 1) * 100) + '% above an average day.';
  }

  function renderAll() {
    var Y = R.get(state.key);
    renderSwitch(); renderHead(Y); renderNow(Y); renderRings(Y); renderTiles(Y); renderWall(Y); renderMonths(Y); renderAreas(Y); renderCal(Y); renderClock(Y); renderDows(Y);
  }

  document.addEventListener('click', function (e) {
    var k = e.target.closest('[data-k]'), f = e.target.closest('[data-f]'), o = e.target.closest('[data-o]');
    if (k) { state.key = k.getAttribute('data-k'); state.cal = null; renderAll(); }
    if (f) { state.filter = f.getAttribute('data-f'); [].forEach.call(document.querySelectorAll('#filters button'), function (x) { x.setAttribute('aria-pressed', x === f); }); renderWall(R.get(state.key)); }
    if (o) { state.sort = o.getAttribute('data-o'); [].forEach.call(document.querySelectorAll('#sorts button'), function (x) { x.setAttribute('aria-pressed', x === o); }); renderWall(R.get(state.key)); }
  });
  $('cal-prev').addEventListener('click', function () { state.cal--; renderCal(R.get(state.key)); });
  $('cal-next').addEventListener('click', function () { state.cal++; renderCal(R.get(state.key)); });
  $('cal-today').addEventListener('click', function () { state.cal = null; renderCal(R.get(state.key)); });

  var links = [].slice.call(document.querySelectorAll('.tabs a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + x.target.id); }); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    ['overview', 'shelf', 'stats', 'share'].forEach(function (id) { io.observe($(id)); });
  }

  renderAll();
  $('share-mini').innerHTML = '<span class="cv">' + cover(R.find('the-way-of-kings')) + '</span>';
})();
