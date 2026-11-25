(function () {
  'use strict';
  var R = window.RJ, v = document.body.getAttribute('data-v'), Y = R.get(2026), t = Y.totals;
  var pick = ['the-way-of-kings', 'harry-potter-and-the-prisoner-of-azkaban', 'full-moon-coffee-shop', 'piranesi', 'in-other-rooms-other-wonders', 'dune', 'braiding-sweetgrass', 'exhalation'];
  var box = document.querySelector('[data-covers]');
  if (box) box.innerHTML = pick.map(function (s, i) { var b = R.find(s); return '<span class="oc" style="--i:' + i + '">' + R.coverSVG(b, v) + '</span>'; }).join('');
  var vals = { titles: R.int(t.titles), pages: R.int(t.pages), hours: R.int(t.readH + t.listenH), readh: R.int(t.readH), listenh: R.int(t.listenH), year: '2026' };
  [].forEach.call(document.querySelectorAll('[data-s]'), function (el) { el.textContent = vals[el.getAttribute('data-s')]; });
  var og = document.querySelector('.og');
  function fit() {
    if (location.search.indexOf('raw') > -1) return;
    var s = Math.min(1, window.innerWidth / 1200);
    og.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    og.style.transformOrigin = 'top left';
    document.querySelector('.og-stage').style.height = (630 * s) + 'px';
  }
  fit(); window.addEventListener('resize', fit);
})();
