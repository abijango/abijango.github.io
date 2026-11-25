(function () {
  'use strict';
  var R = window.RJ, $ = function (id) { return document.getElementById(id); };
  var KEYS = [['2026', '2026'], ['2025', '2025'], ['all', 'All']];
  var state = { key: '2026', filter: 'all' };

  function href(b) { return 'book-c.html?b=' + b.slug; }
  function cover(b) { return R.coverSVG(b, 'c'); }
  function hour12(h) { return (h % 12 === 0 ? 12 : h % 12) + ' ' + (h < 12 ? 'AM' : 'PM'); }

  function renderSwitch() {
    $('year-switch').innerHTML = KEYS.map(function (k) { return '<button role="tab" type="button" data-k="' + k[0] + '" aria-selected="' + (k[0] === state.key) + '">' + k[1] + '</button>'; }).join('');
  }

  function renderHero(Y) {
    var t = Y.totals;
    $('year-big').textContent = Y.key === 'all' ? '’25—26' : Y.key;
    $('deck').textContent = Y.key === '2026' ? 'Thirty stories, a thousand-page doorstop, and a commute that sounds like a full cast.' : Y.key === '2025' ? 'Twenty-two books: a lot of space opera, one long wintry novel, and the last page on the 14th of December.' : 'Two years of the journal so far. One shelf, many commutes.';
    var items = [
      [R.int(t.titles), '', 'Titles finished', t.read + ' read, ' + t.listen + ' heard'],
      [R.int(t.pages), '', 'Pages read', 'about ' + R.int(t.pages / Math.max(1, t.read)) + ' a book'],
      [R.int(t.readH), 'h', 'Hours reading', R.int(t.activeDays) + ' days, ' + Math.round(t.avgSession) + ' min a sitting'],
      [R.int(t.listenH), 'h', 'Hours listening', R.int(t.listenDays) + ' days, ' + t.speed.toFixed(2).replace(/0$/, '') + '× speed']
    ];
    $('headline').innerHTML = items.map(function (it, i) {
      return '<div class="fade" style="--i:' + (i + 1) + '"><dt>' + it[2] + '<span class="sub">' + it[3] + '</span></dt><dd>' + it[0] + (it[1] ? '<small>' + it[1] + '</small>' : '') + '</dd></div>';
    }).join('');
  }

  function renderMarquee(Y) {
    var list = Y.books.slice(0, 22);
    var one = list.map(function (b) { return '<a class="cv" href="' + href(b) + '" tabindex="-1" aria-hidden="true">' + cover(b) + '</a>'; }).join('');
    $('m-track').innerHTML = one + one;
  }

  function renderNow(Y) {
    if (!Y.current.length) { $('now').innerHTML = '<li class="mono cap">Nothing in progress in this view. Switch back to 2026.</li>'; return; }
    $('now').innerHTML = Y.current.map(function (b, i) {
      var l = b.kind === 'listen';
      return '<li><a class="now-row fade' + (l ? ' l' : '') + '" style="--i:' + (i + 2) + '" href="' + href(b) + '"><span class="n mono">0' + (i + 1) + '</span><span class="cv">' + cover(b) + '</span>' +
        '<span><h3>' + R.esc(b.title) + '</h3><p class="au">' + R.esc(b.author) + '<span>' + (b.status === 'paused' ? 'PAUSED' : l ? 'LISTENING' : 'READING') + '</span></p>' +
        '<span class="line" role="progressbar" aria-valuenow="' + b.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + R.esc(b.title) + ' progress" style="display:block"><i style="--w:' + b.pct + '%;--i:' + i + '"></i></span></span>' +
        '<span class="pct">' + b.pct + '<small>%</small><span>' + R.eta(b) + '</span></span></a></li>';
    }).join('');
  }

  function renderGoals(Y) {
    $('goals').innerHTML = R.goalRows(Y).map(function (g, i) {
      var met = g.pct >= 100;
      return '<div class="goal' + (met ? ' met' : '') + '"><p class="lab">' + g.label + '</p><p class="fig">' + g.fmt(g.value) + '<small>of ' + g.fmt(g.goal) + g.unit + ' goal</small></p>' +
        '<div class="meter" role="progressbar" aria-valuenow="' + Math.round(g.pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + g.label + ' goal"><i style="--w:' + Math.min(100, g.pct) + '%;--i:' + i + '"></i></div>' +
        '<p class="pc">' + Math.round(g.pct) + '%' + (met ? ' &mdash; +' + Math.round(g.pct - 100) + ' over' : ' &mdash; ' + g.fmt(g.goal - g.value) + g.unit + ' to go') + '</p>' + (met ? '<span class="stamp" style="--i:' + i + '">Goal met</span>' : '') + '</div>';
    }).join('');
  }

  function renderSheet(Y) {
    var fives = 0;
    $('shelf-note').textContent = Y.books.length + ' finished, newest first. The big ones are five-star reads.';
    $('sheet').innerHTML = Y.books.map(function (b, i) {
      var big = b.rating === 5 && (fives++ % 3 === 0) && fives <= 10;
      var off = state.filter !== 'all' && b.kind !== state.filter;
      return '<a class="fade' + (big ? ' big' : '') + (off ? ' dim' : '') + '" style="--i:' + Math.min(i, 12) + '" data-kind="' + b.kind + '" href="' + href(b) + '" aria-label="' + R.esc(b.title + ', ' + b.author) + '"><span class="cv">' + cover(b) + '</span>' + (b.kind === 'listen' ? '<span class="au">AUDIO</span>' : '') +
        '<span class="cap"><b>' + R.esc(R.coverTitle(b.title)) + '</b>' + R.esc(b.author) + ' &middot; ' + R.stars(b.rating) + '</span></a>';
    }).join('');
  }

  function renderMonths(Y) {
    var max = Math.max.apply(null, Y.months.map(function (m) { return m.read + m.listen; })) || 1, dense = Y.months.length > 12, H = 190;
    $('months').innerHTML = '<div class="mrow' + (dense ? ' dense' : '') + '" role="img" aria-label="Titles finished per month">' + Y.months.map(function (m, i) {
      var tot = m.read + m.listen;
      return '<div class="mc"><span class="v">' + (tot || '') + '</span><div class="st" style="--i:' + i + ';height:' + (tot ? Math.max(8, tot / max * H) : 4) + 'px" title="' + m.label + ': ' + m.read + ' read, ' + m.listen + ' heard">' +
        (m.listen ? '<i class="l" style="height:' + (m.listen / tot * 100) + '%"></i>' : '') + (m.read ? '<i style="height:' + (m.read / tot * 100) + '%"></i>' : (tot ? '' : '<i style="height:100%;background:rgba(243,236,219,.18)"></i>')) + '</div><span class="lb"><span class="f">' + (dense ? m.label.charAt(0) : m.label.slice(0, 3)) + '</span><span class="i">' + m.label.charAt(0) + '</span></span></div>';
    }).join('') + '</div><p class="mkey"><i></i>read<i class="l"></i>heard</p>';
  }

  function renderPixels(Y) {
    var rows = [], idx = {}, map = {};
    Y.days.forEach(function (d) { map[d.date] = d; });
    var first, last;
    if (Y.key === 'all') { first = R.parseDate(Y.days[0].date); last = R.parseDate(Y.days[Y.days.length - 1].date); first = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1)); }
    else { first = new Date(Date.UTC(Y.year, 0, 1)); last = new Date(Date.UTC(Y.year, 11, 31)); }
    var q = Y.days.map(function (d) { return d.r; }).filter(Boolean).sort(function (a, b) { return a - b; });
    var q1 = q[Math.floor(q.length * 0.25)], q2 = q[Math.floor(q.length * 0.5)], q3 = q[Math.floor(q.length * 0.8)];
    var h = '', n = 0, ym, y = first.getUTCFullYear(), m = first.getUTCMonth();
    while (y * 12 + m <= last.getUTCFullYear() * 12 + last.getUTCMonth()) {
      var dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), row = '<div class="px-row"><span class="m">' + R.MONTHS[m] + (Y.key === 'all' && m === 0 ? ' ’' + String(y).slice(2) : '') + '</span>';
      for (var d = 1; d <= 31; d++) {
        if (d > dim) { row += '<i class="px x"></i>'; continue; }
        var iso = y + '-' + R.pad(m + 1) + '-' + R.pad(d), day = map[iso];
        if (!day) { row += '<i class="px f" title="' + iso + '"></i>'; continue; }
        var lv = day.r <= 0 ? 0 : (day.r < q1 ? 1 : day.r < q2 ? 2 : day.r < q3 ? 3 : 4);
        row += '<i class="px' + (lv ? ' s' + lv : '') + (day.l > 40 ? ' ul' : '') + '" style="--i:' + n + ';--j:' + d + '" title="' + iso + ' · ' + Math.round(day.r) + ' min read · ' + Math.round(day.l) + ' min heard"></i>';
      }
      h += row + '</div>'; n++;
      m++; if (m > 11) { m = 0; y++; }
    }
    $('pixels').innerHTML = h;
  }

  function renderHours(Y) {
    var tot = Y.hoursR.map(function (v, i) { return v + Y.hoursL[i]; }), max = R.max(tot), peak = tot.indexOf(max), H = 96;
    var pr = Y.hoursR.indexOf(R.max(Y.hoursR)), pl = Y.hoursL.indexOf(R.max(Y.hoursL));
    $('peak').innerHTML = hour12(pr).replace(' ', '<small>') + '</small>';
    $('hours').innerHTML = '<div class="hbars" role="img" aria-label="Minutes by hour of day">' + tot.map(function (v, i) {
      return '<div class="' + (i === peak ? 'pk' : '') + '" style="--i:' + i + ';height:' + Math.max(2, v / max * H) + 'px" title="' + R.pad(i) + ':00"><i class="l" style="height:' + (Y.hoursL[i] / v * 100) + '%"></i><i style="height:' + (Y.hoursR[i] / v * 100) + '%"></i></div>';
    }).join('') + '</div><div class="haxis"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span></div>';
    $('peak-note').innerHTML = 'Books come out around ' + hour12(pr) + '. Audio peaks at ' + hour12(pl) + ', on the way somewhere.';
  }

  function renderDows(Y) {
    var tot = Y.dowR.map(function (v, i) { return v + Y.dowL[i]; }), max = R.max(tot);
    var order = [0, 1, 2, 3, 4, 5, 6].sort(function (a, b) { return tot[b] - tot[a]; });
    $('fav').innerHTML = R.DOW_LONG[order[0]] + '<small>' + Math.round(tot[order[0]] / 60) + ' h</small>';
    $('dows').innerHTML = '<ol class="rank">' + order.map(function (d, i) {
      return '<li><span class="k">' + (i + 1) + '</span><span class="d">' + R.DOW_LONG[d] + '</span><span class="t"><i style="--w:' + (tot[d] / max * 100) + '%;--i:' + i + '"><b style="width:' + (Y.dowR[d] / tot[d] * 100) + '%"></b><b class="l" style="width:' + (Y.dowL[d] / tot[d] * 100) + '%"></b></i></span><span class="h">' + Math.round(tot[d] / 60) + ' h</span></li>';
    }).join('') + '</ol>';
  }

  function renderPace(Y) {
    var t = Y.totals;
    $('pace').innerHTML = [
      [Math.round(t.avgSession), 'min', 'Average sitting', 'about ' + Math.round(t.avgSession * t.pace / 60) + ' pages at a time'],
      [Math.round(t.pace), 'pages / h', 'Reading pace', 'a page every ' + Math.round(3600 / t.pace) + ' seconds'],
      [t.streak, 'days', 'Current streak', 'longest run: ' + t.longestStreak + ' days']
    ].map(function (x, i) { return '<div class="fade" style="--i:' + i + '"><p class="n">' + x[0] + '<small>' + x[1] + '</small></p><p class="l">' + x[2] + '</p><p class="s">' + x[3] + '</p></div>'; }).join('');
  }

  function renderAll() {
    var Y = R.get(state.key);
    renderSwitch(); renderHero(Y); renderMarquee(Y); renderNow(Y); renderGoals(Y); renderSheet(Y); renderMonths(Y); renderPixels(Y); renderHours(Y); renderDows(Y); renderPace(Y);
  }

  document.addEventListener('click', function (e) {
    var k = e.target.closest('[data-k]'), f = e.target.closest('[data-f]');
    if (k) { state.key = k.getAttribute('data-k'); renderAll(); }
    if (f) { state.filter = f.getAttribute('data-f'); [].forEach.call(document.querySelectorAll('#filters button'), function (x) { x.setAttribute('aria-pressed', x === f); }); renderSheet(R.get(state.key)); }
  });

  renderAll();
  $('share-mini').innerHTML = '<span class="cv">' + cover(R.find('the-way-of-kings')) + '</span>';
})();
