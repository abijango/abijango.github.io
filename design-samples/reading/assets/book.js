(function () {
  'use strict';
  var R = window.RJ, b = R.find(R.bookParam()) || R.find('the-way-of-kings');
  var listen = b.kind === 'listen', fin = b.status === 'finished';
  var d = R.detail(b), col = listen ? 'var(--listen)' : 'var(--read)';
  document.title = b.title + ' · reading log · design sample';
  document.getElementById('crumb').innerHTML = '<span class="ps">~/reading/' + (fin ? b.finished.slice(0, 4) : 'now') + '</span> <span class="dollar">$</span> open ' + b.slug;

  function hours(sec) { return R.hm(sec / 60) + '<small> h</small>'; }
  var facts, panel;

  if (fin) {
    facts = [
      ['finished', R.longDate(b.finished)],
      ['started', R.longDate(d.started)],
      ['time to finish', d.days + '<small> days</small>'],
      ['sessions', d.sessions],
      ['time spent', hours(d.seconds)],
      ['avg session', Math.round(d.avgSession) + '<small> min</small>']
    ];
    if (!listen) facts.push(['pages', R.int(b.pages)], ['pages / day', Math.round(d.perDay)]);

    var year = b.finished.slice(0, 4), peers = R.get(year).books.map(R.detail), n = peers.length;
    function avg(f) { return peers.reduce(function (a, p) { return a + f(p); }, 0) / n; }
    var metrics = [
      ['days to finish', d.days, avg(function (p) { return p.days; }), function (v) { return Math.round(v) + ' d'; }],
      ['sessions', d.sessions, avg(function (p) { return p.sessions; }), function (v) { return Math.round(v); }],
      ['time spent', d.seconds / 3600, avg(function (p) { return p.seconds / 3600; }), function (v) { return Math.round(v * 10) / 10 + ' h'; }]
    ];
    panel = '<div class="panel bk-cmp"><h3 class="ph">vs your ' + year + ' average <span class="legend"><i class="lg" style="background:' + col + '"></i>this book <i class="lg avg"></i>average</span></h3>' +
      metrics.map(function (m, i) {
        var max = Math.max(m[1], m[2]) * 1.08;
        return '<div class="cmp"><span class="cl">' + m[0] + '</span><span class="bar" role="img" aria-label="' + m[0] + ': ' + m[3](m[1]) + ', average ' + m[3](m[2]) + '"><i style="--w:' + (m[1] / max * 100) + '%;--c:' + col + ';--i:' + i + '"></i><u style="left:' + (m[2] / max * 100) + '%"></u></span><span class="cv2"><b>' + m[3](m[1]) + '</b> &middot; avg ' + m[3](m[2]) + '</span></div>';
      }).join('') + '</div>';
  } else {
    var days = Math.max(1, Math.round(d.days * b.pct / 100)), started = new Date(R.TODAY.getTime() - days * 864e5).toISOString().slice(0, 10);
    facts = [
      ['progress', b.pct + '<small> %</small>'],
      ['started', R.longDate(started)],
      [listen ? 'days listening' : 'days reading', days]
    ];
    if (!listen) facts.push(['pages', R.int(b.pages)]);
    panel = '<div class="panel bk-cmp"><h3 class="ph">progress <span class="legend">' + R.eta(b) + '</span></h3>' +
      '<span class="bar" role="progressbar" aria-valuenow="' + b.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + R.esc(b.title) + ' progress"><i style="--w:' + b.pct + '%;--c:' + col + '"></i></span></div>';
  }

  var cols = facts.length % 4 === 0 ? 4 : 3;
  document.getElementById('book').innerHTML =
    '<div class="bk-main">' +
      '<div class="bk-head"><h1>' + R.esc(b.title) + '</h1><p class="byline">' + R.esc(b.author) + (b.rating ? ' &middot; <span class="rating" aria-label="' + b.rating + ' of 5">' + R.stars(b.rating) + '</span>' : '') + '</p></div>' +
      '<dl class="facts" style="--cols:' + cols + '">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      panel +
    '</div>' +
    '<aside class="bk-side">' +
      '<div class="cv-wrap"><span class="badge' + (listen ? ' listen' : '') + '">' + (listen ? 'listened' : 'read') + '</span><span class="cv">' + R.coverSVG(b) + '</span></div>' +
      '<div class="bk-share"><div class="actions"><button class="btn primary" type="button" id="copy">copy link</button><a class="btn" href="og.html">year card &rarr;</a><a class="btn" href="index.html">&larr; all books</a></div>' +
      '<h3 class="ph">link preview</h3>' +
      '<div class="unfurl"><div class="u-cv"><span class="cv">' + R.coverSVG(b) + '</span></div><div class="u-t"><b>' + R.esc(b.title) + ' · abijango</b>' + (b.rating ? R.stars(b.rating) + ' · ' : '') + R.esc(b.author) + ', ' + (fin ? 'finished ' + R.longDate(b.finished) : 'in progress, ' + b.pct + '%') + '<span>abijango.github.io/reading/books/' + b.slug + '</span></div></div></div>' +
    '</aside>';
  var btn = document.getElementById('copy');
  btn.addEventListener('click', function () { btn.textContent = 'copied (mock)'; setTimeout(function () { btn.textContent = 'copy link'; }, 1600); });
})();
