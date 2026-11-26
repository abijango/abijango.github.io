(function () {
  'use strict';
  var R = window.RJ, b = R.find(R.bookParam()) || R.find('the-way-of-kings');
  var d = R.detail(b), listen = b.kind === 'listen', fin = b.status === 'finished';
  var size = listen ? R.int(b.hours * 10) / 10 + '<small> h</small>' : R.int(b.pages) + '<small> pages</small>';
  document.title = b.title + ' · reading log · design sample';
  document.getElementById('crumb').innerHTML = '<span class="ps">~/reading/' + (fin ? b.finished.slice(0, 4) : 'now') + '</span> <span class="dollar">$</span> open ' + b.slug;
  var max = R.max(d.daily);
  var facts = [
    [fin ? 'finished' : 'status', fin ? R.longDate(b.finished) : (b.status + ' &middot; ' + b.pct + '%')],
    ['started', R.longDate(d.started)],
    [listen ? 'length' : 'length', size],
    ['time to finish', d.days + '<small> days</small>'],
    ['sessions', d.sessions],
    ['avg session', Math.round(d.avgSession) + '<small> min</small>'],
    [listen ? 'hours / day' : 'pages / day', (d.perDay).toFixed(listen ? 1 : 0)],
    ['format', R.esc(b.format)]
  ];
  document.getElementById('book').innerHTML =
    '<div class="bk-main">' +
      '<div class="bk-head"><h1>' + R.esc(b.title) + '</h1><p class="byline">' + R.esc(b.author) + ' &middot; ' + R.esc(b.genre) + (b.rating ? ' &middot; <span class="rating" aria-label="' + b.rating + ' of 5">' + R.stars(b.rating) + '</span>' : '') + '</p></div>' +
      '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="panel bk-take"><blockquote>' + R.esc(d.take) + '<footer>&mdash; abijango, on finishing &middot; sample copy</footer></blockquote></div>' +
      '<div class="panel bk-spark"><h3 class="ph">' + (listen ? 'hours' : 'pages') + ' per active day</h3>' +
      '<div class="spark' + (listen ? ' listen' : '') + '" role="img" aria-label="Bars showing daily progress">' + d.daily.map(function (v, i) { return '<i style="--i:' + i + ';height:' + Math.max(4, v / max * 100) + '%" title="' + v.toFixed(listen ? 1 : 0) + '"></i>'; }).join('') + '</div>' +
      '<div class="spark-axis"><span>' + R.longDate(d.started) + '</span><span>' + (fin ? R.longDate(b.finished) : 'today') + '</span></div></div>' +
    '</div>' +
    '<aside class="bk-side">' +
      '<div class="cv-wrap"><span class="badge' + (listen ? ' listen' : '') + '">' + (listen ? 'listened' : 'read') + '</span><span class="cv">' + R.coverSVG(b) + '</span></div>' +
      '<div class="bk-share"><div class="actions"><button class="btn primary" type="button" id="copy">copy link</button><a class="btn" href="og.html">year card &rarr;</a><a class="btn" href="index.html">&larr; all books</a></div>' +
      '<h3 class="ph">link preview</h3>' +
      '<div class="unfurl"><div class="u-cv"><span class="cv">' + R.coverSVG(b) + '</span></div><div class="u-t"><b>' + R.esc(b.title) + ' · abijango</b>' + (b.rating ? R.stars(b.rating) + ' · ' : '') + R.esc(b.author) + ', ' + (fin ? 'finished ' + R.longDate(b.finished) : 'in progress') + '<span>abijango.github.io/reading/books/' + b.slug + '</span></div></div></div>' +
    '</aside>';
  var btn = document.getElementById('copy');
  btn.addEventListener('click', function () { btn.textContent = 'copied (mock)'; setTimeout(function () { btn.textContent = 'copy link'; }, 1600); });
})();
