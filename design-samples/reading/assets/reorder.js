/*
 * Rearrangeable widgets (main column and sidebar, each within its own zone).
 * Pointer-events drag from the "::" handle (works with mouse, pen and touch), ArrowUp / ArrowDown on the focused
 * handle, and a reset control. Order is saved in localStorage. No framework.
 */
(function () {
  'use strict';
  var KEY = 'reading.layout.v1';
  var zones = [].slice.call(document.querySelectorAll('[data-zone]'));
  var live = document.getElementById('layout-live'), resetBtn = document.getElementById('reset-layout');
  if (!zones.length) return;

  function ids(zone) { return [].map.call(zone.querySelectorAll(':scope > .widget'), function (w) { return w.getAttribute('data-w'); }); }
  var DEFAULT = {}; zones.forEach(function (z) { DEFAULT[z.getAttribute('data-zone')] = ids(z); });

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function save() {
    var o = {}; zones.forEach(function (z) { o[z.getAttribute('data-zone')] = ids(z); });
    try { if (same(o, DEFAULT)) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage unavailable: order lasts for the page only */ }
    syncReset();
  }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function current() { var o = {}; zones.forEach(function (z) { o[z.getAttribute('data-zone')] = ids(z); }); return o; }
  function syncReset() { if (resetBtn) resetBtn.disabled = same(current(), DEFAULT); }
  function say(msg) { if (live) live.textContent = msg; }

  function apply(order) {
    zones.forEach(function (z) {
      var want = (order && order[z.getAttribute('data-zone')]) || [], have = {};
      [].forEach.call(z.querySelectorAll(':scope > .widget'), function (w) { have[w.getAttribute('data-w')] = w; });
      want.forEach(function (id) { if (have[id]) { z.appendChild(have[id]); delete have[id]; } });
      Object.keys(have).forEach(function (id) { z.appendChild(have[id]); });
    });
  }

  function mkGrip(w) {
    var host = w.querySelector('.ph, .sec'); if (!host) return;
    var name = w.getAttribute('data-name') || w.getAttribute('data-w');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'grip'; b.textContent = '::';
    b.setAttribute('aria-label', 'Move ' + name + '. Drag, or press arrow up or down.');
    b.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
    b.title = 'drag to move, or arrow up / down';
    host.appendChild(b);
    return b;
  }

  function move(w, dir) {
    var z = w.parentNode, sib = dir < 0 ? w.previousElementSibling : w.nextElementSibling;
    while (sib && !sib.classList.contains('widget')) sib = dir < 0 ? sib.previousElementSibling : sib.nextElementSibling;
    if (!sib) { say(w.getAttribute('data-name') + ' is already ' + (dir < 0 ? 'first' : 'last') + '.'); return false; }
    if (dir < 0) z.insertBefore(w, sib); else z.insertBefore(w, sib.nextSibling);
    flash(w); save();
    var list = ids(z); say(w.getAttribute('data-name') + ' moved to position ' + (list.indexOf(w.getAttribute('data-w')) + 1) + ' of ' + list.length + '.');
    return true;
  }
  function flash(w) { w.classList.remove('moved'); void w.offsetWidth; w.classList.add('moved'); }

  /* ---- pointer drag ---- */
  var drag = null;
  function clearMarks() { [].forEach.call(document.querySelectorAll('.drop-before, .drop-after'), function (e) { e.classList.remove('drop-before', 'drop-after'); }); }
  function pick(zone, y, self) {
    var best = null, bestD = 1e9;
    [].forEach.call(zone.querySelectorAll(':scope > .widget'), function (w) {
      if (w === self) return;
      var r = w.getBoundingClientRect(), c = r.top + r.height / 2, d = Math.abs(y - c);
      if (d < bestD) { bestD = d; best = { el: w, after: y > c }; }
    });
    return best;
  }
  function autoscroll() {
    if (!drag) return;
    var y = drag.y, h = window.innerHeight, edge = 70, dy = 0;
    if (y < edge) dy = -Math.ceil((edge - y) / 5); else if (y > h - edge) dy = Math.ceil((y - (h - edge)) / 5);
    if (dy) { window.scrollBy(0, dy); update(); }
    drag.raf = requestAnimationFrame(autoscroll);
  }
  function update() {
    if (!drag) return;
    clearMarks();
    drag.target = pick(drag.zone, drag.y, drag.w);
    if (drag.target) drag.target.el.classList.add(drag.target.after ? 'drop-after' : 'drop-before');
  }
  function end(commit) {
    if (!drag) return;
    var d = drag; drag = null;
    cancelAnimationFrame(d.raf);
    try { d.grip.releasePointerCapture(d.pid); } catch (err) { /* already released */ }
    clearMarks();
    d.w.classList.remove('dragging'); document.body.classList.remove('is-dragging');
    if (commit && d.target) {
      var t = d.target;
      if (t.after) d.zone.insertBefore(d.w, t.el.nextSibling); else d.zone.insertBefore(d.w, t.el);
      flash(d.w); save();
      var list = ids(d.zone); say(d.w.getAttribute('data-name') + ' moved to position ' + (list.indexOf(d.w.getAttribute('data-w')) + 1) + ' of ' + list.length + '.');
    }
    d.grip.focus({ preventScroll: true });
  }

  function bind(w, grip) {
    grip.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      drag = { w: w, zone: w.parentNode, grip: grip, pid: e.pointerId, y: e.clientY, target: null, raf: 0 };
      try { grip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      w.classList.add('dragging'); document.body.classList.add('is-dragging');
      update(); drag.raf = requestAnimationFrame(autoscroll);
    });
    grip.addEventListener('pointermove', function (e) { if (drag && drag.grip === grip) { drag.y = e.clientY; update(); } });
    grip.addEventListener('pointerup', function () { end(true); });
    grip.addEventListener('pointercancel', function () { end(false); });
    grip.addEventListener('lostpointercapture', function () { if (drag && drag.grip === grip) end(false); });
    grip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (move(w, e.key === 'ArrowUp' ? -1 : 1)) grip.focus({ preventScroll: false });
      } else if (e.key === 'Escape' && drag) end(false);
    });
  }

  apply(load());
  [].forEach.call(document.querySelectorAll('.widget'), function (w) { var g = mkGrip(w); if (g) bind(w, g); });
  if (resetBtn) resetBtn.addEventListener('click', function () { apply(DEFAULT); try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } syncReset(); say('Layout reset to the default order.'); });
  syncReset();
  window.RJLayout = { current: current, DEFAULT: DEFAULT };
})();
