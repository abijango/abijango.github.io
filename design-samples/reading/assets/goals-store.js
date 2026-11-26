/*
 * Goal types, seed defaults and the sample's localStorage store.
 * Real build: the same shape would be read from and written to the Worker (KV), owner-only.
 * Titles are not stored here: that target comes from BookOrbit (reading-history summary goal).
 */
(function () {
  'use strict';
  var R = window.RJ, KEY = 'reading.goals.v1';
  var int = R.int;

  function avgMinutes(Y) { return Y.days.length ? Y.totals.readMin / Y.days.length : 0; }

  var TYPES = [
    { id: 'titles', label: 'Titles finished', unit: '', step: 1, agg: 'sum', synced: true, value: function (Y) { return Y.goal.reached; }, fmt: int },
    { id: 'pages', label: 'Pages', unit: '', step: 100, agg: 'sum', value: function (Y) { return Y.totals.pages; }, fmt: int },
    { id: 'hoursReading', label: 'Hours reading', unit: 'h', step: 5, agg: 'sum', value: function (Y) { return Y.totals.readH; }, fmt: int },
    { id: 'hoursListening', label: 'Hours listening', unit: 'h', step: 5, agg: 'sum', value: function (Y) { return Y.totals.listenH; }, fmt: int },
    { id: 'daysRead', label: 'Days read', unit: 'days', step: 5, agg: 'sum', value: function (Y) { return Y.totals.activeDays; }, fmt: int },
    { id: 'longestStreak', label: 'Longest streak', unit: 'days', step: 1, agg: 'max', value: function (Y) { return Y.totals.longestStreak; }, fmt: int },
    { id: 'avgMinutes', label: 'Avg minutes per day', unit: 'min', step: 1, agg: 'mean', value: avgMinutes, fmt: int }
  ];
  var BY_ID = {}; TYPES.forEach(function (t) { BY_ID[t.id] = t; });

  /* Identical copy of goals.json, used when the page is opened from file:// where fetch() is blocked. */
  var FALLBACK = {
    version: 1, period: 'year', enabled: ['titles', 'pages', 'hoursReading', 'hoursListening'],
    targets: {
      pages: { 2026: 9000, 2025: 7000 }, hoursReading: { 2026: 250, 2025: 180 }, hoursListening: { 2026: 100, 2025: 40 },
      daysRead: { 2026: 300, 2025: 280 }, longestStreak: { 2026: 60, 2025: 40 }, avgMinutes: { 2026: 40, 2025: 30 }
    }
  };

  var seed = FALLBACK, ready = [], loaded = false;
  function finish(s) { seed = s || FALLBACK; loaded = true; ready.splice(0).forEach(function (f) { f(); }); }
  function load() {
    if (!window.fetch || location.protocol === 'file:') { finish(FALLBACK); return; }
    fetch('goals.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(finish, function () { finish(FALLBACK); });
  }
  function whenReady(f) { if (loaded) f(); else ready.push(f); }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function defaults() { return { enabled: seed.enabled.slice(), targets: clone(seed.targets) }; }

  function read() {
    var d = defaults(), raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
    if (!raw || !Array.isArray(raw.enabled)) return d;
    var out = { enabled: raw.enabled.filter(function (id) { return BY_ID[id]; }), targets: d.targets };
    Object.keys(raw.targets || {}).forEach(function (id) { if (BY_ID[id]) out.targets[id] = Object.assign({}, d.targets[id] || {}, raw.targets[id]); });
    return out;
  }
  function write(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: edits last for the page only */ } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
  function isCustom() { try { return localStorage.getItem(KEY) !== null; } catch (e) { return false; } }

  function targetFor(type, state, Y) {
    if (type.id === 'titles') return Y.goal.target;
    var t = (state.targets[type.id] || {}), years = Y.key === 'all' ? [2025, 2026] : [Y.year], vals = [];
    for (var i = 0; i < years.length; i++) { var v = t[years[i]]; if (v == null || v === '' || isNaN(+v)) return null; vals.push(+v); }
    if (type.agg === 'max') return Math.max.apply(null, vals);
    if (type.agg === 'mean') return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    return vals.reduce(function (a, b) { return a + b; }, 0);
  }

  function rows(Y, state) {
    return state.enabled.map(function (id) {
      var type = BY_ID[id], value = type.value(Y), target = targetFor(type, state, Y);
      return { id: id, label: type.label, unit: type.unit, fmt: type.fmt, value: value, target: target, pct: target ? value / target * 100 : null };
    });
  }

  function rowsHtml(list) {
    if (!list.length) return '<div class="goal goal-empty"><div class="gl">no goals picked</div><a class="edit-goals" href="goals.html">edit goals</a></div>';
    return list.map(function (g, i) {
      var head = '<div class="goal fade" style="--i:' + (i + 1) + '"><div class="gl">' + g.label + '</div>';
      if (g.target == null) return head + '<div class="gv"><b>' + g.fmt(g.value) + '</b>' + (g.unit ? ' ' + g.unit : '') + ' &nbsp;<a class="edit-goals" href="goals.html">set target</a></div></div>';
      var capped = Math.min(100, g.pct), over = g.pct > 100;
      return head +
        '<div class="bar" role="progressbar" aria-valuenow="' + Math.round(g.pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + g.label + ' goal"><i style="--w:' + capped + '%;--c:' + (over ? 'var(--read)' : 'var(--blue)') + ';--i:' + i + '"></i></div>' +
        '<div class="gv"><b>' + g.fmt(g.value) + '</b> / ' + g.fmt(g.target) + (g.unit ? ' ' + g.unit : '') + ' &nbsp;' + (over ? '<span class="over">+' + Math.round(g.pct - 100) + '%</span>' : '<span class="dim">' + Math.round(g.pct) + '%</span>') + '</div></div>';
    }).join('');
  }

  window.RG = { rowsHtml: rowsHtml, TYPES: TYPES, BY_ID: BY_ID, read: read, write: write, reset: reset, isCustom: isCustom, defaults: defaults, rows: rows, ready: whenReady, targetFor: targetFor };
  load();
})();
