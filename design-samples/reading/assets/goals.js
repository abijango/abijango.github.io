(function () {
  'use strict';
  var R = window.RJ, G = window.RG, $ = function (id) { return document.getElementById(id); };
  var YEARS = [2026, 2025], state = G.read(), year = 2026, timer = 0;

  function persist() {
    G.write(state);
    var el = $('saved'); el.textContent = 'saved'; clearTimeout(timer); timer = setTimeout(function () { el.textContent = ''; }, 1600);
    $('reset-goals').disabled = !G.isCustom();
  }

  function rowHtml(type, pos) {
    var on = state.enabled.indexOf(type.id) > -1, n = state.enabled.length;
    var Y = R.get(year), t = (state.targets[type.id] || {})[year];
    var input;
    if (type.synced) input = '<input class="tin" type="number" value="' + Y.goal.target + '" disabled aria-label="' + type.label + ' target (synced from BookOrbit)"><span class="unit">' + (type.unit || '') + '</span>';
    else input = '<input class="tin" type="number" min="0" step="' + type.step + '" inputmode="numeric" data-t="' + type.id + '" value="' + (t == null ? '' : t) + '" placeholder="target" aria-label="' + type.label + ' target for ' + year + '"><span class="unit">' + (type.unit || '') + '</span>';
    return '<li class="grow' + (on ? ' on' : '') + '" data-id="' + type.id + '">' +
      '<button type="button" class="sw" role="switch" aria-checked="' + on + '" data-sw="' + type.id + '" aria-label="' + type.label + '"><span class="box">' + (on ? '[x]' : '[ ]') + '</span></button>' +
      '<span class="gname"><b>' + type.label + '</b>' + (type.synced ? '<em class="tag sync">synced from BookOrbit</em>' : '') + '</span>' +
      '<span class="gin">' + input + '</span>' +
      '<span class="tag per">per year</span>' +
      (on ? '<span class="ord"><span class="pos">' + String(pos + 1).padStart(2, '0') + '</span>' +
        '<button type="button" class="mv" data-mv="' + type.id + ':-1" aria-label="Move ' + type.label + ' up"' + (pos === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button type="button" class="mv" data-mv="' + type.id + ':1" aria-label="Move ' + type.label + ' down"' + (pos === n - 1 ? ' disabled' : '') + '>&darr;</button></span>' : '') +
      '</li>';
  }

  function render(keepFocus) {
    var picked = state.enabled.map(function (id, i) { return rowHtml(G.BY_ID[id], i); }).join('');
    var rest = G.TYPES.filter(function (t) { return state.enabled.indexOf(t.id) < 0; }).map(function (t) { return rowHtml(t, -1); }).join('');
    $('picked').innerHTML = picked || '<li class="gnone">nothing picked</li>';
    $('menu').innerHTML = rest || '<li class="gnone">all goal types picked</li>';
    $('year-switch').innerHTML = YEARS.map(function (y) { return '<button role="tab" type="button" data-y="' + y + '" aria-selected="' + (y === year) + '">' + y + '</button>'; }).join('');
    preview();
    $('reset-goals').disabled = !G.isCustom();
    if (keepFocus) { var el = document.querySelector(keepFocus); if (el) el.focus(); }
  }
  function preview() { $('preview').innerHTML = G.rowsHtml(G.rows(R.get(year), state)); }

  document.addEventListener('click', function (e) {
    var sw = e.target.closest('[data-sw]'), mv = e.target.closest('[data-mv]'), y = e.target.closest('[data-y]');
    if (sw) {
      var id = sw.getAttribute('data-sw'), i = state.enabled.indexOf(id);
      if (i > -1) state.enabled.splice(i, 1); else state.enabled.push(id);
      persist(); render('[data-sw="' + id + '"]');
    } else if (mv) {
      var p = mv.getAttribute('data-mv').split(':'), id2 = p[0], d = +p[1], j = state.enabled.indexOf(id2), k = j + d;
      if (j < 0 || k < 0 || k >= state.enabled.length) return;
      state.enabled.splice(k, 0, state.enabled.splice(j, 1)[0]);
      persist(); render('[data-mv="' + id2 + ':' + d + '"]:not(:disabled)') ;
      if (!document.activeElement || document.activeElement === document.body) { var alt = document.querySelector('[data-mv="' + id2 + ':' + (-d) + '"]:not(:disabled)'); if (alt) alt.focus(); }
    } else if (y) {
      year = +y.getAttribute('data-y'); render();
    }
  });

  document.addEventListener('input', function (e) {
    var inp = e.target.closest('[data-t]'); if (!inp) return;
    var id = inp.getAttribute('data-t'), v = inp.value.trim();
    var t = state.targets[id] || (state.targets[id] = {});
    if (v === '' || isNaN(+v) || +v < 0) delete t[year]; else t[year] = +v;
    persist(); preview();
  });

  $('reset-goals').addEventListener('click', function () { G.reset(); state = G.read(); render(); $('saved').textContent = 'reset'; });

  G.ready(function () { state = G.read(); render(); });
  render();
})();
