/* Joshos Marine — small tools on the service pages. No dependencies.
   Each one upgrades markup that already reads sensibly without JavaScript. */
(function () {
  'use strict';

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------------
     Voltage drop (marine electrical page)
     drop = current x resistance of the cable, there and back.
     Copper is taken as 0.018 ohm per metre for each mm2 of conductor.
     ------------------------------------------------------------------------ */
  function voltageDrop(root) {
    var RHO = 0.018, NOMINAL = 12, BATTERY = 12.6;
    var amps = $('[data-in="amps"]', root), run = $('[data-in="run"]', root), size = $('[data-in="size"]', root);
    if (!amps || !run || !size) return;
    var sizes = $$('option', size).map(function (o) { return Number(o.value); });
    var out = function (name, text) { var el = $('[data-out="' + name + '"]', root); if (el) el.textContent = text; };
    var pctFor = function (I, L, A) { return (2 * L * I * RHO / A) / NOMINAL * 100; };
    var trim = function (n) { return String(Math.round(n * 10) / 10).replace(/\.0$/, ''); };

    function update() {
      var I = Number(amps.value), L = Number(run.value), A = Number(size.value);
      var pct = pctFor(I, L, A), drop = pct / 100 * NOMINAL;
      var level = pct <= 3 ? 'good' : pct <= 10 ? 'ok' : 'bad';
      var enough = sizes.filter(function (s) { return pctFor(I, L, s) <= 3; })[0];

      out('amps', I + ' A');
      out('run', trim(L) + ' m');
      out('pct', pct >= 10 ? String(Math.round(pct)) : pct.toFixed(1));
      out('volts', drop.toFixed(2) + ' V');
      out('arrive', Math.max(0, BATTERY - drop).toFixed(1) + ' V');
      out('verdict', level === 'good' ? 'Good for electronics and nav lights'
        : level === 'ok' ? 'Fine for pumps and general lighting, too much for electronics'
        : 'Too much. The gear will run badly or drop out');
      out('tip', level === 'good' ? 'This cable is big enough for this load over this run.'
        : enough ? 'To stay at 3% or under on this run, go to ' + trim(enough) + ' mm² or bigger.'
        : 'Even ' + trim(sizes[sizes.length - 1]) + ' mm² loses more than 3% here. Shorten the run or split the load.');

      root.setAttribute('data-level', level);
      var bar = $('[data-bar]', root);
      if (bar) bar.style.width = Math.max(2, Math.min(100, pct / 15 * 100)) + '%';
    }
    [amps, run, size].forEach(function (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  }

  /* ------------------------------------------------------------------------
     Pre-tow check (boat trailer page). Nothing is saved: it is a list to run
     through at the ramp or in the driveway.
     ------------------------------------------------------------------------ */
  function preTow(root) {
    var boxes = $$('input[type="checkbox"]', root);
    var status = $('[data-pretow-status]', root);
    var reset = $('[data-pretow-reset]', root);
    if (!boxes.length || !status) return;

    function update() {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      var all = done === boxes.length;
      root.classList.toggle('is-done', all);
      status.textContent = all ? 'All ' + boxes.length + ' checked. Good to go.' : done + ' of ' + boxes.length + ' checked';
      if (reset) reset.hidden = done === 0;
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    if (reset) reset.addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; });
      update();
      boxes[0].focus();
    });
    update();
  }

  $$('[data-vdrop]').forEach(voltageDrop);
  $$('[data-pretow]').forEach(preTow);
})();
