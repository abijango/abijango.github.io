(function () {
  'use strict';
  var R = window.RJ, b = R.find(R.bookParam()) || R.find('the-way-of-kings');
  var d = R.detail(b), listen = b.kind === 'listen', fin = b.status === 'finished';
  document.title = b.title + ' · reading journal · Direction B';
  var cum = [], s = 0, total = d.daily.reduce(function (a, v) { return a + v; }, 0);
  d.daily.forEach(function (v) { s += v; cum.push(s / total * 100); });
  var W = 600, H = 120;
  var pts = [[0, H]].concat(cum.map(function (v, i) { return [(i + 1) / cum.length * W, H - v / 100 * (H - 8) - 4]; }));
  var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
  var facts = [
    [listen ? R.int(b.hours * 10) / 10 : R.int(b.pages), listen ? 'hours' : 'pages', 'Length'],
    [d.days, 'days', 'Start to finish'],
    [d.sessions, '', 'Sessions'],
    [Math.round(d.avgSession), 'min', 'Average sitting']
  ];
  document.getElementById('book').innerHTML =
    '<div class="cvw"><span class="cv">' + R.coverSVG(b, 'b') + '</span></div>' +
    '<div><p class="kicker">' + (listen ? 'Listened' : 'Read') + ' · ' + R.esc(b.format) + ' · ' + R.esc(b.genre) + '</p><h1>' + R.esc(b.title) + '</h1><p class="by">by ' + R.esc(b.author) + '</p>' +
    '<p class="stars" aria-label="' + (b.rating || 0) + ' out of 5">' + (b.rating ? R.stars(b.rating) : '') + '<small>' + (fin ? 'Finished ' + R.longDate(b.finished) : b.status + ' · ' + b.pct + '%') + '</small></p>' +
    '<blockquote class="quote">' + R.esc(d.take) + '<footer>abijango · sample copy</footer></blockquote>' +
    '<dl class="facts">' + facts.map(function (f) { return '<div><dd>' + f[0] + (f[1] ? '<small>' + f[1] + '</small>' : '') + '</dd><dt>' + f[2] + '</dt></div>'; }).join('') + '</dl>' +
    '<div class="tl"><p class="kicker">How it went · ' + (listen ? 'hours' : 'pages') + ' over time</p><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Cumulative progress through the book"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ece6a" stop-opacity=".35"/><stop offset="1" stop-color="#9ece6a" stop-opacity="0"/></linearGradient></defs>' +
    '<path d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="url(#bg1)"/><path d="' + line + '" fill="none" stroke="#9ece6a" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg><div class="ax"><span>' + R.longDate(d.started) + '</span><span>' + (fin ? R.longDate(b.finished) : 'today') + '</span></div></div>' +
    '<div class="actions"><button type="button" class="btn primary" id="copy">Copy link</button><a class="btn" href="og-b.html">Year card</a><a class="btn" href="direction-b.html">All books</a></div>' +
    '<p class="kicker lbl">Link preview, as a chat app shows it</p><div class="unfurl"><div class="u-img"><span class="cv">' + R.coverSVG(b, 'b') + '</span><div><span>' + (b.rating ? R.stars(b.rating) : '') + '</span><b>' + R.esc(R.coverTitle(b.title)) + '</b><span style="color:var(--mute)">' + R.esc(b.author) + '</span></div></div><div class="u-t"><b>' + R.esc(b.title) + ' · abijango</b>abijango.github.io/reading/books/' + b.slug + '</div></div></div>';
  var btn = document.getElementById('copy');
  btn.addEventListener('click', function () { btn.textContent = 'Copied (mock)'; setTimeout(function () { btn.textContent = 'Copy link'; }, 1600); });
})();
