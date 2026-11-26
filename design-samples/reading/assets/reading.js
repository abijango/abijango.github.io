(function () {
  'use strict';
  var R = window.RJ, $ = function (id) { return document.getElementById(id); };
  var KEYS = [['2026', '2026'], ['2025', '2025'], ['all', 'all-time']];
  var state = { key: '2026', filter: 'all' };

  function cover(b) { return R.coverSVG(b); }
  function bookHref(b) { return 'book.html?b=' + b.slug; }
  function pctText(n) { return Math.round(n) + '%'; }

  function renderSwitch() {
    $('year-switch').innerHTML = KEYS.map(function (k) {
      return '<button role="tab" type="button" data-k="' + k[0] + '" aria-selected="' + (k[0] === state.key) + '">' + k[1] + '</button>';
    }).join('');
  }

  function renderHeadline(Y) {
    var t = Y.totals;
    var items = [
      ['titles finished', R.int(t.titles), '', '<b class="c-read">' + t.read + '</b> read &middot; <b class="c-listen">' + t.listen + '</b> listened'],
      ['pages read', R.int(t.pages), '', 'about ' + R.int(t.pages / Math.max(1, t.read + 1)) + ' per book'],
      ['reading time', R.int(t.readH), '<small>h</small>', R.int(t.activeDays) + ' reading days'],
      ['listening time', R.int(t.listenH), '<small>h</small>', R.int(t.listenDays) + ' listening days']
    ];
    $('headline').innerHTML = items.map(function (it, i) {
      return '<div class="stat fade" style="--i:' + i + '"><p class="k">' + it[0] + '</p><p class="v">' + it[1] + it[2] + '</p>' + (it[3] ? '<p class="s">' + it[3] + '</p>' : '') + '</div>';
    }).join('');
  }

  function renderNow(Y) {
    var cur = Y.current;
    if (!cur.length) {
      $('now').innerHTML = '<div class="now" style="grid-column:1/-1"><p class="dim" style="margin:0">Nothing in progress for this view. Switch back to 2026.</p></div>';
      return;
    }
    $('now').innerHTML = cur.map(function (b, i) {
      var col = b.kind === 'listen' ? 'var(--listen)' : 'var(--read)';
      var unit = b.kind === 'listen' ? 'listening' : (b.status === 'paused' ? 'paused' : 'reading');
      return '<a class="now fade" style="--i:' + (i + 2) + '" href="' + bookHref(b) + '">' +
        '<span class="cv">' + cover(b) + '</span>' +
        '<span><p class="tagline" style="margin:0 0 .25rem"><b style="color:' + col + '">' + unit + '</b> &middot; ' + R.esc(b.format) + '</p>' +
        '<h3>' + R.esc(b.title) + '</h3><p class="au">' + R.esc(b.author) + '</p>' +
        '<span class="bar" role="progressbar" aria-valuenow="' + b.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + R.esc(b.title) + ' progress"><i style="--w:' + b.pct + '%;--c:' + col + ';--i:' + i + '"></i></span>' +
        '<span class="prog"><b>' + b.pct + '%</b><span>' + R.eta(b) + '</span></span></span></a>';
    }).join('');
  }

  function renderGoals(Y) {
    var rows = R.goalRows(Y);
    $('goals').innerHTML = rows.map(function (g, i) {
      var capped = Math.min(100, g.pct), over = g.pct > 100;
      return '<div class="goal fade" style="--i:' + (i + 1) + '"><div class="gl">' + g.label + '</div>' +
        '<div class="bar" role="progressbar" aria-valuenow="' + Math.round(g.pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + g.label + ' goal"><i style="--w:' + capped + '%;--c:' + (over ? 'var(--read)' : 'var(--blue)') + ';--i:' + i + '"></i></div>' +
        '<div class="gv"><b>' + g.fmt(g.value) + '</b> / ' + g.fmt(g.goal) + g.unit + ' &nbsp;' + (over ? '<span class="over">+' + Math.round(g.pct - 100) + '%</span>' : '<span class="dim">' + pctText(g.pct) + '</span>') + '</div></div>';
    }).join('');
  }

  function renderShelf(Y) {
    var groups = {}, order = [];
    Y.books.forEach(function (b) {
      var k = b.finished.slice(0, 7);
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(b);
    });
    var n = 0;
    $('shelf').setAttribute('data-filter', state.filter);
    $('shelf').innerHTML = order.map(function (k) {
      var list = groups[k], d = R.parseDate(k + '-01');
      var r = list.filter(function (b) { return b.kind === 'read'; }).length;
      return '<div class="month"><h3>' + R.MONTHS[d.getUTCMonth()].toLowerCase() + ' ' + d.getUTCFullYear() + '<span>' + [r ? r + ' read' : '', list.length - r ? (list.length - r) + ' heard' : ''].filter(Boolean).join(' &middot; ') + '</span></h3><div class="wall">' +
        list.map(function (b) {
          return '<a class="fade" style="--i:' + (n++ % 12) + '" data-kind="' + b.kind + '" data-s="' + b.slug + '" href="' + bookHref(b) + '" aria-label="' + R.esc(b.title + ' by ' + b.author) + '"><span class="cv">' + cover(b) + '</span></a>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function renderMonths(Y) {
    var max = Math.max.apply(null, Y.months.map(function (m) { return m.read + m.listen; })) || 1, dense = Y.months.length > 12;
    var nowM = Y.key !== '2025' ? Y.months.length - 1 : -1;
    var H = 150;
    $('months').className = 'months' + (dense ? ' dense' : '');
    $('months').innerHTML = Y.months.map(function (m, i) {
      var tot = m.read + m.listen, label = dense ? (m.label.charAt(0) + (m.label === 'Jan' ? '’' + String(m.year).slice(2) : '')) : m.label.toLowerCase();
      return '<div class="mcol' + (i === nowM ? ' cur' : '') + '"><span class="val">' + (tot || '') + '</span><div class="stack" style="--i:' + i + ';height:' + (tot ? Math.max(4, tot / max * H) : 2) + 'px" title="' + m.label + ': ' + m.read + ' read, ' + m.listen + ' listened">' +
        (m.listen ? '<i class="l" style="height:' + (m.listen / tot * 100) + '%"></i>' : '') + (m.read ? '<i style="height:' + (m.read / tot * 100) + '%"></i>' : (tot ? '' : '<i style="height:100%;background:var(--line)"></i>')) + '</div><span class="lab">' + label + '</span></div>';
    }).join('');
  }

  var MIN_STEPS = [1, 15, 30, 45, 60, 90];
  function lvlMin(v) { var n = 0; for (var i = 0; i < MIN_STEPS.length; i++) if (v >= MIN_STEPS[i]) n = i + 1; return n; }
  function shortDate(iso) { var d = R.parseDate(iso); return d.getUTCDate() + ' ' + R.MONTHS[d.getUTCMonth()]; }

  function renderHeat(Y) {
    var map = {}, months = {}, best = null;
    Y.days.forEach(function (d) {
      map[d.date] = d;
      var k = d.date.slice(0, 7); months[k] = (months[k] || 0) + d.r;
      if (!best || d.r > best.r) best = d;
    });
    var first, last;
    if (Y.key === 'all') { first = R.parseDate(Y.days[0].date); last = R.parseDate(Y.days[Y.days.length - 1].date); }
    else { first = new Date(Date.UTC(Y.year, 0, 1)); last = new Date(Date.UTC(Y.year, 11, 31)); }
    var offset = first.getUTCDay(), cells = '', labels = '', i = 0, lastMonth = -1, lastCol = 2;
    for (var t = first.getTime(); t <= last.getTime(); t += 864e5, i++) {
      var dt = new Date(t), iso = dt.toISOString().slice(0, 10), col = Math.floor((i + offset) / 7) + 2, row = dt.getUTCDay() + 2, d = map[iso];
      lastCol = col;
      if (dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
        var mh = months[iso.slice(0, 7)];
        labels += '<span class="mo" style="grid-column:' + col + '">' + R.MONTHS[dt.getUTCMonth()].toLowerCase() + (mh != null ? '<em>' + Math.round(mh / 60) + ' h</em>' : '') + '</span>';
        lastMonth = dt.getUTCMonth();
      }
      if (!d) { cells += '<i class="cell fut" style="grid-column:' + col + ';grid-row:' + row + '"></i>'; continue; }
      cells += '<i class="cell s' + lvlMin(d.r) + (d === best ? ' best' : '') + '" data-d="' + iso + '" style="grid-column:' + col + ';grid-row:' + row + ';--c:' + (col - 2) + '"></i>';
    }
    var dl = '<span class="dl" style="grid-row:3">mon</span><span class="dl" style="grid-row:5">wed</span><span class="dl" style="grid-row:7">fri</span>';
    var el = $('heat');
    el.innerHTML = '<div class="heat" style="grid-template-columns:1.9rem repeat(' + (lastCol - 1) + ',minmax(0,1fr));min-width:calc(1.9rem + ' + (lastCol - 1) + ' * (0.7rem + 3px))">' + labels + dl + cells + '</div>';
    $('heat-best').innerHTML = 'best day <b style="color:var(--hot)">' + shortDate(best.date) + '</b> &middot; ' + R.hm(best.r) + ' h';
    $('heat-legend').innerHTML = '<span class="lbl">minutes</span><i></i><span class="lbl">0</span><i class="s1"></i><span class="lbl">1+</span><i class="s2"></i><span class="lbl">15</span><i class="s3"></i><span class="lbl">30</span><i class="s4"></i><span class="lbl">45</span><i class="s5"></i><span class="lbl">60</span><i class="s6"></i><span class="lbl">90+</span><span class="mk"></span><span class="lbl">best day</span>';
    hideTip();
    el.scrollLeft = Y.key === '2025' ? 0 : el.scrollWidth;
  }

  /* tooltip: pointer hover, or tap on touch. Pages are an estimate (minutes x year pace). */
  var tip = $('tip'), tipOn = null;
  function tipHtml(iso) {
    var Y = R.get(state.key), d = null;
    Y.days.some(function (x) { if (x.date === iso) { d = x; return true; } });
    var dt = R.parseDate(iso), head = R.DOWS[dt.getUTCDay()] + ' ' + dt.getUTCDate() + ' ' + R.MONTHS[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear();
    if (!d || (d.r <= 0 && d.l <= 0)) return '<b>' + head + '</b>no reading';
    return '<b>' + head + '</b>' + (d.r > 0 ? '<span class="r">' + Math.round(d.r) + ' min read</span> &middot; <span class="p">~' + Math.round(d.p) + ' pages</span>' : 'no reading') + (d.l > 0 ? '<br><span class="l">' + Math.round(d.l) + ' min heard</span>' : '');
  }
  function placeTip(x, y) {
    var w = tip.offsetWidth, h = tip.offsetHeight, nx = Math.min(window.innerWidth - w - 8, Math.max(8, x + 14)), ny = y - h - 12 < 8 ? y + 18 : y - h - 12;
    tip.style.left = nx + 'px'; tip.style.top = ny + 'px';
  }
  function showTip(c) { if (tipOn) tipOn.classList.remove('sel'); tipOn = c; c.classList.add('sel'); tip.innerHTML = tipHtml(c.getAttribute('data-d')); tip.hidden = false; }
  function hideTip() { tip.hidden = true; if (tipOn) tipOn.classList.remove('sel'); tipOn = null; }
  function bindHeat() {
    var root = $('heat');
    root.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var c = e.target.closest('[data-d]'); if (!c) { hideTip(); return; }
      if (tipOn !== c) showTip(c);
      placeTip(e.clientX, e.clientY);
    });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') hideTip(); });
    root.addEventListener('scroll', hideTip);
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-d]'); if (!c || window.matchMedia('(hover: hover)').matches) return;
      if (tipOn === c) { hideTip(); return; }
      showTip(c); var r = c.getBoundingClientRect(); placeTip(r.left + r.width / 2, r.top);
    });
  }

  function renderHours(Y) {
    var tot = Y.hoursR.map(function (v, i) { return v + Y.hoursL[i]; }), max = R.max(tot), H = 120, peak = tot.indexOf(max);
    $('hours').innerHTML = '<div class="hours" role="img" aria-label="Reading and listening minutes by hour of day">' + tot.map(function (v, i) {
      return '<div class="hcol' + (i === peak ? ' peak' : '') + '" style="--i:' + i + ';height:' + Math.max(2, v / max * H) + 'px;align-self:flex-end" title="' + R.pad(i) + ':00 · ' + Math.round(Y.hoursR[i] / 60) + ' h read · ' + Math.round(Y.hoursL[i] / 60) + ' h heard">' +
        '<i class="l" style="height:' + (Y.hoursL[i] / v * 100) + '%"></i><i style="height:' + (Y.hoursR[i] / v * 100) + '%"></i></div>';
    }).join('') + '</div><div class="haxis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>';
    var pr = Y.hoursR.indexOf(R.max(Y.hoursR)), pl = Y.hoursL.indexOf(R.max(Y.hoursL));
  }

  function renderDows(Y) {
    var tot = Y.dowR.map(function (v, i) { return v + Y.dowL[i]; }), max = R.max(tot), top = tot.indexOf(max);
    var order = [1, 2, 3, 4, 5, 6, 0];
    $('dows').innerHTML = order.map(function (d, i) {
      return '<div class="dow' + (d === top ? ' top' : '') + '"><span class="d">' + R.DOWS[d].toLowerCase() + '</span><div class="t" style="width:' + (tot[d] / max * 100) + '%;min-width:0"><i style="--w:' + (Y.dowR[d] / tot[d] * 100) + '%;width:' + (Y.dowR[d] / tot[d] * 100) + '%;--i:' + i + '"></i><i class="l" style="width:' + (Y.dowL[d] / tot[d] * 100) + '%;--i:' + i + '"></i></div><span class="n">' + Math.round(tot[d] / 60) + ' h</span></div>';
    }).join('');
  }

  function renderPace(Y) {
    var t = Y.totals;
    var items = [
      ['avg reading session', Math.round(t.avgSession), '<small>min</small>', 'about ' + Math.round(t.avgSession * t.pace / 60) + ' pages'],
      ['reading pace', Math.round(t.pace), '<small>pages/h</small>', ''],
      ['listening speed', t.speed.toFixed(2).replace(/0$/, ''), '<small>&times;</small>', 'avg ' + Math.round(t.avgListenSession) + ' min on listening days'],
      ['current streak', t.streak, '<small>days</small>', ''],
      ['longest streak', t.longestStreak, '<small>days</small>', ''],
      ['avg rating', t.avgRating.toFixed(1), '<small>/ 5</small>', R.stars(Math.round(t.avgRating * 2) / 2)]
    ];
    $('pace').innerHTML = items.map(function (it) { return '<div class="kv"><p class="k">' + it[0] + '</p><p class="v">' + it[1] + it[2] + '</p>' + (it[3] ? '<p class="s">' + it[3] + '</p>' : '') + '</div>'; }).join('');
  }

  function renderTraj(Y) {
    var panel = $('traj-panel'), tr = Y.trajectory;
    if (!tr) { $('traj').innerHTML = '<p class="note" style="margin:0">Trajectory is per year. Pick 2026 or 2025.</p>'; return; }
    var W = 600, H = 140, max = Math.max.apply(null, tr.map(function (p) { return Math.max(p.targetCumulative, p.actualCumulative || 0); })) * 1.08;
    function xy(p, v) { return ((p.month - 1) / 11 * W).toFixed(1) + ' ' + (H - 6 - v / max * (H - 14)).toFixed(1); }
    var tgt = tr.map(function (p, i) { return (i ? 'L' : 'M') + xy(p, p.targetCumulative); }).join(' ');
    var act = tr.filter(function (p) { return p.actualCumulative != null; }), last = act[act.length - 1];
    var line = act.map(function (p, i) { return (i ? 'L' : 'M') + xy(p, p.actualCumulative); }).join(' ');
    var grid = [0.25, 0.5, 0.75, 1].map(function (f) { var y = (H - 6 - f * (H - 14) / 1.08).toFixed(1); return '<line class="grid" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"/>'; }).join('');
    $('traj').className = 'traj';
    $('traj').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Cumulative titles finished against a straight-line target">' + grid + '<path class="tgt" d="' + tgt + '"/><path class="act" d="' + line + '"/></svg>' +
      '<div class="axis">' + R.MONTHS.map(function (m) { return '<span>' + m.toLowerCase() + '</span>'; }).join('') + '</div>';
  }

  function renderFunnel(Y) {
    var f = Y.funnel, rows = [['started', f.started], ['reached 25%', f.reached25], ['reached 50%', f.reached50], ['reached 75%', f.reached75], ['completed', f.completed]];
    $('funnel').innerHTML = rows.map(function (r, i) {
      return '<div class="fun"><span>' + r[0] + '</span><div class="t"><i style="--w:' + (r[1] / f.started * 100) + '%;--i:' + i + '"></i></div><span class="n"><b>' + r[1] + '</b> &middot; ' + Math.round(r[1] / f.started * 100) + '%</span></div>';
    }).join('');
  }

  function renderShare() {
    var b = R.find('the-way-of-kings');
    $('share-mini').innerHTML = '<span class="cv">' + cover(b) + '</span>';
  }

  function bindShelf() {
    var shelf = $('shelf'), st = $('shelf-status');
    function show(e) {
      var a = e.target.closest && e.target.closest('a[data-s]'); if (!a) return;
      var b = R.find(a.getAttribute('data-s')); if (!b) return;
      st.innerHTML = '<b>' + R.esc(b.title) + '</b> &middot; ' + R.esc(b.author) + ' &middot; ' + R.longDate(b.finished) + ' &middot; <span style="color:var(--warn)">' + R.stars(b.rating) + '</span>';
    }
    shelf.addEventListener('mouseover', show); shelf.addEventListener('focusin', show);
  }

  function renderAll() {
    var Y = R.get(state.key);
    $('hero-file').textContent = state.key === 'all' ? 'all-time' : state.key;
    renderSwitch(); renderHeadline(Y); renderNow(Y); renderGoals(Y); renderShelf(Y); renderMonths(Y); renderHeat(Y); renderHours(Y); renderDows(Y); renderPace(Y); renderTraj(Y); renderFunnel(Y);
  }

  document.addEventListener('click', function (e) {
    var k = e.target.closest('[data-k]'), f = e.target.closest('[data-f]');
    if (k) { state.key = k.getAttribute('data-k'); renderAll(); }
    if (f) {
      state.filter = f.getAttribute('data-f');
      [].forEach.call(document.querySelectorAll('#filters button'), function (b) { b.setAttribute('aria-pressed', b === f); });
      $('shelf').setAttribute('data-filter', state.filter);
    }
  });

  renderAll(); renderShare(); bindShelf(); bindHeat();
})();
