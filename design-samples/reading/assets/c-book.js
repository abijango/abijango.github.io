(function () {
  'use strict';
  var R = window.RJ, b = R.find(R.bookParam()) || R.find('the-way-of-kings');
  var d = R.detail(b), listen = b.kind === 'listen', fin = b.status === 'finished';
  document.title = b.title + ' · Direction C · Annual report';
  var max = R.max(d.daily);
  var words = R.coverTitle(b.title).split(' '), cut = Math.ceil(words.length / 2);
  var title = words.length > 2 ? R.esc(words.slice(0, cut).join(' ')) + ' <em>' + R.esc(words.slice(cut).join(' ')) + '</em>' : R.esc(words.join(' '));
  var rows = [
    ['Finished', fin ? R.longDate(b.finished) : b.status + ' · ' + b.pct + '%'],
    ['Started', R.longDate(d.started)],
    ['Length', listen ? R.int(b.hours * 10) / 10 + '<small>hours</small>' : R.int(b.pages) + '<small>pages</small>'],
    ['Time taken', d.days + '<small>days</small>'],
    ['Sessions', d.sessions + '<small>avg ' + Math.round(d.avgSession) + ' min</small>'],
    ['Format', R.esc(b.format) + '<small>' + R.esc(b.genre) + '</small>']
  ];
  document.getElementById('book').innerHTML =
    '<div class="bk-top"><p class="mono kick">' + (listen ? 'Listened' : 'Read') + ' · ' + (fin ? b.finished.slice(0, 4) : 'in progress') + '</p><h1 class="bk-title">' + title + '</h1></div>' +
    '<div class="bk-main"><div class="cvw"><span class="cv">' + R.coverSVG(b, 'c') + '</span></div><div>' +
    '<div class="verdict"><span class="big">' + (b.rating ? b.rating : '–') + '</span><span class="of"><b>' + (b.rating ? R.stars(b.rating) : '') + '</b>out of 5, by ' + R.esc(b.author) + '</span></div>' +
    '<dl class="rows">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl></div></div>' +
    '<div class="paper bk-paper"><div class="inner"><p class="take">' + R.esc(d.take) + '</p><p class="take-by mono">abijango &middot; sample copy</p></div></div>' +
    '<div class="timeline"><h3 class="mono ch" style="margin-top:2.5rem">Progress, ' + (listen ? 'hours' : 'pages') + ' per active day</h3><div class="tbars' + (listen ? ' l' : '') + '" role="img" aria-label="Daily progress">' + d.daily.map(function (v, i) { return '<i style="--i:' + i + ';height:' + Math.max(4, v / max * 100) + '%" title="' + v.toFixed(listen ? 1 : 0) + '"></i>'; }).join('') + '</div><div class="tax mono"><span>' + R.longDate(d.started) + '</span><span>' + (fin ? R.longDate(b.finished) : 'today') + '</span></div></div>' +
    '<div class="bk-share"><div><h3 class="mono ch">Share</h3><div class="btns"><button class="btn primary" type="button" id="copy">Copy link</button><a class="btn" href="og-c.html">Year card</a><a class="btn" href="direction-c.html">All books</a></div></div>' +
    '<div><h3 class="mono ch">Link preview</h3><div class="unf"><div class="img"><span class="cv">' + R.coverSVG(b, 'c') + '</span><div><span>' + (b.rating ? R.stars(b.rating) : '') + '</span><b>' + R.esc(R.coverTitle(b.title)) + '</b><span>' + R.esc(b.author.toUpperCase()) + '</span></div></div><div class="t mono"><b>' + R.esc(b.title) + ' · abijango</b>abijango.github.io/reading/books/' + b.slug + '</div></div></div></div>';
  var btn = document.getElementById('copy');
  btn.addEventListener('click', function () { btn.textContent = 'Copied (mock)'; setTimeout(function () { btn.textContent = 'Copy link'; }, 1600); });
})();
