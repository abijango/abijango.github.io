(function () {
  'use strict';
  var R = window.RJ, $ = function (id) { return document.getElementById(id); };
  var state = { key: '2026', mode: 'read' };
  var KEYS = [['2026', '2026'], ['2025', '2025'], ['all', 'all-time']];
  var RAMP_R = ['#171926', '#2a4636', '#35603f', '#4a7a45', '#6a9a4c', '#85b85a', '#a8e07a'];
  var RAMP_L = ['#171926', '#3b3558', '#5a4c8e', '#8f77d0', '#bb9af7'];
  var MIN_STEPS = [1, 15, 30, 45, 60, 90];

  function lvlMin(v) { var n = 0; for (var i = 0; i < MIN_STEPS.length; i++) if (v >= MIN_STEPS[i]) n = i + 1; return n; }
  function lvlListen(v) { return v <= 0 ? 0 : v < 20 ? 1 : v < 45 ? 2 : v < 90 ? 3 : 4; }
  function quartiles(vals) {
    var v = vals.filter(function (x) { return x > 0; }).sort(function (a, b) { return a - b; });
    return [v[Math.floor(v.length * 0.25)], v[Math.floor(v.length * 0.5)], v[Math.floor(v.length * 0.8)]];
  }

  function context(Y) {
    var map = {}; Y.days.forEach(function (d) { map[d.date] = d; });
    var first, last;
    if (Y.key === 'all') { first = R.parseDate(Y.days[0].date); last = R.parseDate(Y.days[Y.days.length - 1].date); }
    else { first = new Date(Date.UTC(Y.year, 0, 1)); last = new Date(Date.UTC(Y.year, 11, 31)); }
    var runs = [], run = null;
    Y.days.forEach(function (d) {
      if (d.r > 0) { if (!run) { run = { start: d.date, end: d.date, len: 0 }; runs.push(run); } run.end = d.date; run.len++; } else run = null;
    });
    var longest = runs.reduce(function (a, b) { return b.len > a.len ? b : a; }, { len: 0 });
    var lastDay = Y.days[Y.days.length - 1].date, cur = runs.length && runs[runs.length - 1].end === lastDay ? runs[runs.length - 1] : null;
    var months = {};
    Y.days.forEach(function (d) { var k = d.date.slice(0, 7); var m = months[k] || (months[k] = { r: 0, l: 0, p: 0 }); m.r += d.r; m.l += d.l; m.p += d.p; });
    return { map: map, first: first, last: last, longest: longest, current: cur, months: months };
  }
  function inRun(run, iso) { return run && iso >= run.start && iso <= run.end; }
  function shortDate(iso) { var d = R.parseDate(iso); return d.getUTCDate() + ' ' + R.MONTHS[d.getUTCMonth()]; }

  function weekCells(Y, C, cellFn) {
    var offset = C.first.getUTCDay(), cells = '', labels = '', i = 0, lastMonth = -1, cols = 0, lastCol = 2;
    for (var t = C.first.getTime(); t <= C.last.getTime(); t += 864e5, i++) {
      var dt = new Date(t), iso = dt.toISOString().slice(0, 10), col = Math.floor((i + offset) / 7) + 2, row = dt.getUTCDay() + 2, d = C.map[iso];
      lastCol = col;
      if (dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
        var mk = iso.slice(0, 7), mm = C.months[mk];
        labels += '<span class="mo" style="grid-column:' + col + '">' + R.MONTHS[dt.getUTCMonth()].toLowerCase() + (mm && cellFn.labelDetail ? '<em>' + cellFn.labelDetail(mm) + '</em>' : '') + '</span>';
        lastMonth = dt.getUTCMonth();
      }
      cells += cellFn(iso, d, col, row, i);
    }
    return { cells: cells, labels: labels, cols: lastCol - 1, offset: offset };
  }
  var DL = '<span class="dl" style="grid-row:3">mon</span><span class="dl" style="grid-row:5">wed</span><span class="dl" style="grid-row:7">fri</span>';
  function scrollEnd(el, Y) { el.scrollLeft = Y.key === '2025' ? 0 : el.scrollWidth; }

  /* ---------- tooltip ---------- */
  var tip = $('tip'), tipOn = null;
  function tipHtml(iso) {
    var Y = R.get(state.key), d = null;
    Y.days.some(function (x) { if (x.date === iso) { d = x; return true; } });
    var dt = R.parseDate(iso), head = R.DOWS[dt.getUTCDay()] + ' ' + dt.getUTCDate() + ' ' + R.MONTHS[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear();
    if (!d) return '<b>' + head + '</b>no data yet';
    if (d.r <= 0 && d.l <= 0) return '<b>' + head + '</b>no reading';
    return '<b>' + head + '</b>' + (d.r > 0 ? '<span class="r">' + Math.round(d.r) + ' min read</span> &middot; <span class="p">' + Math.round(d.p) + ' pages</span>' : 'no reading') + (d.l > 0 ? '<br><span class="l">' + Math.round(d.l) + ' min heard</span>' : '');
  }
  function placeTip(x, y) {
    var w = tip.offsetWidth, h = tip.offsetHeight, nx = Math.min(window.innerWidth - w - 8, Math.max(8, x + 14)), ny = y - h - 12 < 8 ? y + 18 : y - h - 12;
    tip.style.left = nx + 'px'; tip.style.top = ny + 'px';
  }
  function bindTip(root, sel) {
    root.addEventListener('pointermove', function (e) {
      var c = e.target.closest(sel); if (!c) { hideTip(); return; }
      if (tipOn !== c) { if (tipOn) tipOn.classList.remove('sel'); tipOn = c; c.classList.add('sel'); tip.innerHTML = tipHtml(c.getAttribute('data-d')); tip.hidden = false; }
      placeTip(e.clientX, e.clientY);
    });
    root.addEventListener('pointerleave', hideTip);
    root.addEventListener('scroll', hideTip);
  }
  function hideTip() { tip.hidden = true; if (tipOn) tipOn.classList.remove('sel'); tipOn = null; }

  /* ---------- v0: current ---------- */
  function renderV0(Y, C) {
    var f = state.mode === 'read' ? 'r' : 'l', q = quartiles(Y.days.map(function (d) { return d[f]; })), total = 0, active = 0, lastCol = 0;
    var out = weekCells(Y, C, function (iso, d, col, row, i) {
      if (!d) return '<i class="cell fut" style="grid-column:' + col + ';grid-row:' + row + '" title="' + iso + '"></i>';
      var v = d[f], lv = v <= 0 ? 0 : (v < q[0] ? 1 : v < q[1] ? 2 : v < q[2] ? 3 : 4);
      total += v; if (v > 0) active++; lastCol = col;
      return '<i class="cell l' + lv + '" style="grid-column:' + col + ';grid-row:' + row + ';--c:' + (col - 2) + '" title="' + iso + ' · ' + Math.round(d.r) + ' min read · ' + Math.round(d.l) + ' min heard"></i>';
    });
    $('v0').innerHTML = '<div class="heat" data-mode="' + state.mode + '" style="grid-template-columns:1.9rem repeat(' + out.cols + ',0.8rem)">' + out.labels + DL + out.cells + '</div>';
    $('v0-sum').textContent = R.int(total / 60) + ' h across ' + active + ' days';
    $('v0-modes').innerHTML = '<button type="button" class="mode" data-m="read" aria-pressed="' + (state.mode === 'read') + '">reading</button><button type="button" class="mode" data-m="listen" aria-pressed="' + (state.mode === 'listen') + '">listening</button>';
    scrollEnd($('v0'), Y);
  }

  /* ---------- v1: richer scale + tooltip ---------- */
  function renderV1(Y, C) {
    var best = null; Y.days.forEach(function (d) { if (!best || d.r > best.r) best = d; });
    var fn = function (iso, d, col, row, i) {
      if (!d) return '<i class="cell fut" style="grid-column:' + col + ';grid-row:' + row + '"></i>';
      return '<i class="cell s' + lvlMin(d.r) + (d === best ? ' best' : '') + '" data-d="' + iso + '" style="grid-column:' + col + ';grid-row:' + row + ';--c:' + (col - 2) + '"></i>';
    };
    fn.labelDetail = function (m) { return Math.round(m.r / 60) + ' h'; };
    var out = weekCells(Y, C, fn);
    $('v1').innerHTML = '<div class="heat big" style="grid-template-columns:1.9rem repeat(' + out.cols + ',1rem)">' + out.labels + DL + out.cells + '</div>';
    $('v1-peak').innerHTML = 'best day <b style="color:var(--hot)">' + shortDate(best.date) + '</b> &middot; ' + R.hm(best.r) + ' h';
    $('v1-legend').className = 'heat-legend steps';
    $('v1-legend').innerHTML = '<span class="lbl">minutes</span><i style="background:#171926"></i><span class="lbl">0</span><i class="s1"></i><span class="lbl">1+</span><i class="s2"></i><span class="lbl">15</span><i class="s3"></i><span class="lbl">30</span><i class="s4"></i><span class="lbl">45</span><i class="s5"></i><span class="lbl">60</span><i class="s6"></i><span class="lbl">90+</span><span class="mk best"></span><span class="lbl">best day</span>';
    scrollEnd($('v1'), Y);
  }

  /* ---------- v2: month blocks + streaks ---------- */
  function renderV2(Y, C) {
    var q = quartiles(Y.days.map(function (d) { return d.r; })), h = '';
    var y = C.first.getUTCFullYear(), m = C.first.getUTCMonth(), endKey = C.last.getUTCFullYear() * 12 + C.last.getUTCMonth();
    if (Y.key === 'all') { var f = R.parseDate(Y.days[0].date); y = f.getUTCFullYear(); m = f.getUTCMonth(); }
    while (y * 12 + m <= endKey) {
      var dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), off = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, mk = y + '-' + R.pad(m + 1), mm = C.months[mk], cells = '', i;
      for (i = 0; i < off; i++) cells += '<i class="md o"></i>';
      for (i = 1; i <= dim; i++) {
        var iso = mk + '-' + R.pad(i), d = C.map[iso], cls = 'md';
        if (!d) cls += (iso < Y.days[0].date ? ' o' : ' fut');
        else { var v = d.r; cls += ' l' + (v <= 0 ? 0 : v < q[0] ? 1 : v < q[1] ? 2 : v < q[2] ? 3 : 4); }
        if (inRun(C.longest, iso)) cls += ' longest';
        if (inRun(C.current, iso)) cls += ' current';
        cells += '<i class="' + cls + '" data-d="' + iso + '">' + (cls.indexOf(' o') > -1 ? '' : i) + '</i>';
      }
      h += '<div class="mblock"><h4>' + R.MONTHS[m].toLowerCase() + (Y.key === 'all' ? ' ’' + String(y).slice(2) : '') + '<span>' + (mm ? Math.round(mm.r / 60) + ' h · ' + R.int(mm.p) + ' p' : 'to come') + '</span></h4><div class="mdow"><span>m</span><span>t</span><span>w</span><span>t</span><span>f</span><span>s</span><span>s</span></div><div class="mdays">' + cells + '</div></div>';
      m++; if (m > 11) { m = 0; y++; }
    }
    $('v2').innerHTML = h;
    $('v2-streaks').innerHTML = 'longest <b style="color:var(--hot)">' + C.longest.len + ' days</b> (' + shortDate(C.longest.start) + ' to ' + shortDate(C.longest.end) + ')' + (C.current ? ' &middot; current <b style="color:var(--blue)">' + C.current.len + ' days</b>' : '');
    $('v2-legend').innerHTML = '<span>less</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>more</span><span class="mk longest"></span><span class="lbl">longest streak</span><span class="mk current"></span><span class="lbl">current streak</span>';
    $('v2-legend').className = 'heat-legend';
  }

  /* ---------- v3: split cells ---------- */
  function renderV3(Y, C) {
    var weeks = {};
    var fn = function (iso, d, col, row) {
      var w = weeks[col] || (weeks[col] = { n: 0, act: 0 }); w.n++;
      if (!d) return '<i class="cell fut" style="grid-column:' + col + ';grid-row:' + row + '"></i>';
      if (d.r > 0) w.act++;
      return '<i class="cell sp" data-d="' + iso + '" style="grid-column:' + col + ';grid-row:' + row + ';--c:' + (col - 2) + ';--rc:' + RAMP_R[lvlMin(d.r)] + ';--lc:' + RAMP_L[lvlListen(d.l)] + '"></i>';
    };
    fn.labelDetail = function (m) { return Math.round(m.r / 60) + ' / ' + Math.round(m.l / 60) + ' h'; };
    var out = weekCells(Y, C, fn), dots = '';
    Object.keys(weeks).forEach(function (c) { var w = weeks[c]; if (w.n === 7 && w.act === 7) dots += '<i class="perfect" style="grid-column:' + c + ';grid-row:10" title="7 of 7 days"></i>'; });
    $('v3').innerHTML = '<div class="heat split" style="grid-template-columns:1.9rem repeat(' + out.cols + ',1.05rem)">' + out.labels + DL + out.cells + dots + '</div>';
    $('v3-legend').className = 'heat-legend steps';
    $('v3-legend').innerHTML = '<span class="lbl">read</span><i style="background:#171926"></i><i class="s1"></i><i class="s2"></i><i class="s3"></i><i class="s4"></i><i class="s5"></i><i class="s6"></i><span class="lbl" style="margin-left:1rem">heard</span><i style="background:#171926"></i><i style="background:#3b3558"></i><i style="background:#5a4c8e"></i><i style="background:#8f77d0"></i><i style="background:#bb9af7"></i><span class="lbl" style="margin-left:auto">month label: hours read / heard</span>';
    scrollEnd($('v3'), Y);
  }

  function renderAll() {
    var Y = R.get(state.key), C = context(Y);
    $('year-switch').innerHTML = KEYS.map(function (k) { return '<button role="tab" type="button" data-k="' + k[0] + '" aria-selected="' + (k[0] === state.key) + '">' + k[1] + '</button>'; }).join('');
    renderV0(Y, C); renderV1(Y, C); renderV2(Y, C); renderV3(Y, C);
  }

  document.addEventListener('click', function (e) {
    var k = e.target.closest('[data-k]'), m = e.target.closest('[data-m]');
    if (k) { state.key = k.getAttribute('data-k'); hideTip(); renderAll(); return; }
    if (m) { state.mode = m.getAttribute('data-m'); var Y = R.get(state.key); renderV0(Y, context(Y)); return; }
    var c = e.target.closest('[data-d]');
    if (c && !window.matchMedia('(hover: hover)').matches) {
      if (tipOn === c) { hideTip(); return; }
      hideTip(); tipOn = c; c.classList.add('sel'); tip.innerHTML = tipHtml(c.getAttribute('data-d')); tip.hidden = false;
      var r = c.getBoundingClientRect(); placeTip(r.left + r.width / 2, r.top);
    }
  });
  bindTip($('v1'), '[data-d]'); bindTip($('v2'), '[data-d]'); bindTip($('v3'), '[data-d]');

  renderAll();
})();
