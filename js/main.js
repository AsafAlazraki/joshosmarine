/* Joshos Marine — site behaviour. No dependencies. */
(function () {
  'use strict';

  window.__jmReady = true;

  var cfg = window.JOSHOS || {};
  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, scope) { return (scope || doc).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PLACEHOLDER_PHONE = '+61400000000';

  /* ------------------------------------------------------------------------
     Contact details from js/config.js
     ------------------------------------------------------------------------ */
  function hydrate() {
    if (cfg.phone) $$('[data-phone]').forEach(function (el) { el.textContent = cfg.phone; });
    if (cfg.phoneLink) {
      $$('[data-tel]').forEach(function (el) { el.href = 'tel:' + cfg.phoneLink; });
      $$('[data-sms]').forEach(function (el) { el.href = 'sms:' + cfg.phoneLink; });
    }
    if (cfg.email) {
      $$('[data-email]').forEach(function (el) { el.textContent = cfg.email; });
      $$('[data-mailto]').forEach(function (el) { el.href = 'mailto:' + cfg.email; });
    }

    var hours = (cfg.hours || []).filter(function (row) { return row && row[1]; });
    $$('[data-hours-row]').forEach(function (row) { row.hidden = !hours.length; });
    $$('[data-hours]').forEach(function (el) {
      el.textContent = hours.map(function (row) { return row[0] ? row[0] + ': ' + row[1] : row[1]; }).join('\n');
    });

    $$('[data-area-row]').forEach(function (row) { row.hidden = !cfg.area; });
    $$('[data-area]').forEach(function (el) { el.textContent = cfg.area || ''; });

    $$('[data-abn-wrap]').forEach(function (el) { el.hidden = !cfg.abn; });
    $$('[data-abn]').forEach(function (el) { el.textContent = cfg.abn || ''; });

    var anySocial = false;
    $$('[data-social]').forEach(function (el) {
      var url = cfg[el.getAttribute('data-social')];
      el.hidden = !url;
      if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; anySocial = true; }
    });
    $$('[data-socials]').forEach(function (el) { el.hidden = !anySocial; });

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* Structured data for search engines, once real details are in place. */
  function structuredData() {
    if (!cfg.phoneLink || cfg.phoneLink === PLACEHOLDER_PHONE) return;
    var data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Joshos Marine',
      description: '12V installs, marine servicing, trailer work and custom fit-outs.',
      url: location.origin + location.pathname,
      telephone: cfg.phoneLink,
      makesOffer: ['12V & marine electrical', 'Boat & outboard servicing', 'Boat trailer repairs', 'Custom boat fit-outs'].map(function (name) {
        return { '@type': 'Offer', itemOffered: { '@type': 'Service', name: name } };
      })
    };
    if (cfg.email) data.email = cfg.email;
    if (cfg.area) data.areaServed = cfg.area;
    if (cfg.abn) data.taxID = cfg.abn.replace(/\s+/g, '');
    if (cfg.hoursForSearch && cfg.hoursForSearch.length) data.openingHours = cfg.hoursForSearch;
    var same = [cfg.facebook, cfg.instagram].filter(Boolean);
    if (same.length) data.sameAs = same;
    var tag = doc.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(data);
    doc.head.appendChild(tag);
  }

  /* ------------------------------------------------------------------------
     Header, mobile menu, active nav link
     ------------------------------------------------------------------------ */
  function header() {
    var el = $('[data-header]');
    var toggle = $('[data-nav-toggle]');
    var label = $('[data-nav-toggle-label]');
    var menu = $('[data-mobile-menu]');
    if (!el) return;

    var onScroll = function () { el.classList.toggle('is-stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !menu) return;
    var others = $$('main, .site-footer, .quickbar');

    function setOpen(open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
      el.classList.toggle('is-open', open);
      doc.body.classList.toggle('is-locked', open);
      others.forEach(function (node) { node.inert = open; });
    }

    toggle.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  function activeNav() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav a[href^="#"]');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (section) { io.observe(section); });
  }

  /* ------------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------------ */
  function reveals() {
    var items = $$('[data-reveal]');
    var settle = function (el) {
      el.classList.add('is-in');
      // Once the entrance has played, hand the element back to its own styles
      // so hover transitions aren't slowed down by the reveal timing.
      var delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      setTimeout(function () { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); }, (delay + 1) * 1000 + 100);
    };
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.removeAttribute('data-reveal'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        settle(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Mobile quick-action bar: shows after the hero, steps aside near the forms
     ------------------------------------------------------------------------ */
  function quickbar() {
    var bar = $('[data-quickbar]');
    if (!bar) return;
    var pastHero = false;
    var nearForm = {};
    var update = function () {
      var blocked = Object.keys(nearForm).some(function (k) { return nearForm[k]; });
      bar.classList.toggle('is-visible', pastHero && !blocked);
    };
    window.addEventListener('scroll', function () {
      var next = window.scrollY > window.innerHeight * 0.35;
      if (next !== pastHero) { pastHero = next; update(); }
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { nearForm[entry.target.className] = entry.isIntersecting; });
        update();
      }, { rootMargin: '0px 0px -10% 0px' });
      $$('.booking__card, .callback, .site-footer__bottom').forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------------
     Forms
     ------------------------------------------------------------------------ */
  var LABELS = {
    services: 'Services',
    details: 'Details',
    boat: 'Boat',
    length: 'Length',
    motor: 'Motor',
    location: 'Where',
    suburb: 'Suburb',
    date: 'Preferred date',
    time: 'Time of day',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    contact: 'Contact by',
    best_time: 'Best time to call'
  };
  var ORDER = ['name', 'phone', 'email', 'contact', 'best_time', 'services', 'details', 'boat', 'length', 'motor', 'location', 'suburb', 'date', 'time'];

  function prettyDate(value) {
    var d = new Date(value + 'T00:00');
    if (isNaN(d)) return value;
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      value = String(value).trim();
      if (!value || key === 'company_website') return;
      data[key] = data[key] ? data[key] + ', ' + value : value;
    });
    if (data.date) data.date = prettyDate(data.date);
    return data;
  }

  function fieldError(control, message) {
    var field = control.closest('.field');
    if (!field) return;
    var id = control.id + '-error';
    var el = doc.getElementById(id);
    if (!message) {
      control.classList.remove('is-invalid');
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = doc.createElement('p');
      el.className = 'field__error';
      el.id = id;
      field.appendChild(el);
    }
    el.textContent = message;
    control.classList.add('is-invalid');
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', id);
  }

  /* Validates every control inside `scope`; returns the invalid one nearest the top. */
  function validate(scope) {
    var bad = [];

    $$('[data-required-group]', scope).forEach(function (group) {
      var name = group.getAttribute('data-required-group');
      var ok = $$('input[name="' + name + '"]', group).some(function (i) { return i.checked; });
      var msg = $('[data-group-error="' + name + '"]', scope);
      group.classList.toggle('is-invalid', !ok);
      if (msg) { msg.hidden = ok; msg.textContent = ok ? '' : group.getAttribute('data-error'); }
      if (!ok) bad.push($('input', group));
    });

    $$('input, select, textarea', scope).forEach(function (control) {
      if (!control.willValidate || control.closest('.hp') || control.closest('[data-required-group]')) return;
      if (control.value) control.value = control.value.trim() === '' ? '' : control.value;
      var ok = control.checkValidity();
      fieldError(control, ok ? '' : (control.getAttribute('data-error') || control.validationMessage));
      if (!ok) bad.push(control);
    });

    bad.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    return bad[0] || null;
  }

  function buildMessage(form, data) {
    var subject = (form.getAttribute('data-subject') || 'Website enquiry') + (data.name ? ' — ' + data.name : '');
    var lines = ORDER.filter(function (k) { return data[k]; }).map(function (k) { return LABELS[k] + ': ' + data[k]; });
    var text = subject + '\n\n' + lines.join('\n') + '\n\nSent from the Joshos Marine website.';
    return { subject: subject, text: text };
  }

  /* Hands the request to the visitor's own email app, addressed and filled in. */
  function viaEmailApp(msg) {
    if (!cfg.email) throw new Error('No email address configured');
    location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.text);
    return { mode: 'mailto', text: msg.text };
  }

  function deliver(form, data) {
    var msg = buildMessage(form, data);
    if (!cfg.formEndpoint) return Promise.resolve().then(function () { return viaEmailApp(msg); });

    var payload = {};
    ORDER.forEach(function (k) { if (data[k]) payload[LABELS[k]] = data[k]; });
    payload._subject = msg.subject;
    if (data.email) payload._replyto = data.email;
    Object.keys(cfg.formExtraFields || {}).forEach(function (k) { payload[k] = cfg.formExtraFields[k]; });

    return fetch(cfg.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        // Some services answer 200 with success:false (e.g. not yet activated).
        if (!res.ok || body.success === false || body.success === 'false') throw new Error('Form service did not accept the request');
        return { mode: 'sent', text: msg.text };
      });
    }).catch(function () {
      // Never lose a request: if the service is down or refuses, use the email app instead.
      return viaEmailApp(msg);
    });
  }

  function initForm(form) {
    var wrap = form.parentElement;
    var done = $('[data-done]', wrap);
    var status = $('[data-status]', form);
    var submitBtn = $('[data-submit]', form);
    var submitLabel = $('[data-submit-label]', form);
    var lastText = '';
    var idleLabel = submitLabel ? submitLabel.textContent : '';

    function setStatus(html) {
      if (!status) return;
      status.hidden = !html;
      status.className = 'form__status' + (html ? ' is-error' : '');
      status.innerHTML = html || '';
    }

    // Clear an error as soon as the visitor starts fixing it.
    form.addEventListener('input', function (e) {
      var control = e.target;
      if (control.classList && control.classList.contains('is-invalid') && control.checkValidity()) fieldError(control, '');
      var group = control.closest && control.closest('[data-required-group]');
      if (group && group.classList.contains('is-invalid')) validate(group.parentElement);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var bad = validate(form);
      if (bad) { bad.focus(); return; }

      var data = collect(form);
      var trap = form.elements.company_website;
      var isBot = trap && trap.value;

      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      if (submitLabel) submitLabel.textContent = 'Sending…';

      var job = isBot ? Promise.resolve({ mode: 'sent', text: '' }) : deliver(form, data);
      job.then(function (result) {
        lastText = result.text;
        showDone(result.mode);
      }).catch(function () {
        var phone = cfg.phone || 'us';
        var tel = cfg.phoneLink ? '<a href="tel:' + cfg.phoneLink + '">' + phone + '</a>' : phone;
        setStatus('Sorry, that didn\'t send. Please try again, or call ' + tel + ' and we\'ll take the details over the phone.');
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        if (submitLabel) submitLabel.textContent = idleLabel;
      });
    });

    function showDone(mode) {
      if (!done) return;
      var title = $('[data-done-title]', done);
      var text = $('[data-done-text]', done);
      var copy = $('[data-copy]', done);
      if (!done.dataset.sentTitle) { done.dataset.sentTitle = title.textContent; done.dataset.sentText = text.textContent; }
      if (mode === 'mailto') {
        title.textContent = 'Nearly there.';
        text.textContent = 'Your email app should have opened with the details filled in. Hit send and it\'s on its way. Nothing opened? Copy the details below, or just give us a call.';
      } else {
        title.textContent = done.dataset.sentTitle;
        text.textContent = done.dataset.sentText;
      }
      if (copy) copy.hidden = !(mode === 'mailto' && navigator.clipboard);
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
      var top = wrap.getBoundingClientRect().top;
      if (top < 80) window.scrollTo({ top: window.scrollY + top - 96, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    if (done) {
      var copyBtn = $('[data-copy]', done);
      if (copyBtn) copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(lastText).then(function () {
          var original = copyBtn.textContent;
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = original; }, 1800);
        });
      });
      var restart = $('[data-restart]', done);
      if (restart) restart.addEventListener('click', function () {
        form.reset();
        $$('.is-invalid', form).forEach(function (el) { el.classList.remove('is-invalid'); });
        $$('.field__error', form).forEach(function (el) { if (el.hasAttribute('data-group-error')) el.hidden = true; else el.remove(); });
        done.hidden = true;
        form.hidden = false;
        var top = wrap.getBoundingClientRect().top;
        if (top < 80) window.scrollTo({ top: window.scrollY + top - 96, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

  }

  function forms() {
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    $$('[data-min-today]').forEach(function (el) { el.min = iso; });

    var booking = null;
    $$('form[data-form]').forEach(function (form) {
      initForm(form);
      if (form.getAttribute('data-form') === 'booking') booking = { form: form };
    });

    // "Book this" links pre-tick the matching service on the booking form.
    $$('[data-book]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!booking || booking.form.hidden) return;
        var wanted = link.getAttribute('data-book');
        $$('input[name="services"]', booking.form).forEach(function (input) {
          if (input.value === wanted) input.checked = true;
        });
        validateQuietly(booking.form);
      });
    });
  }

  /* Clears a stale "pick a service" error after a pre-selection. */
  function validateQuietly(form) {
    var group = $('[data-required-group].is-invalid', form);
    if (!group) return;
    group.classList.remove('is-invalid');
    var msg = $('[data-group-error]', form);
    if (msg) msg.hidden = true;
  }

  hydrate();
  structuredData();
  header();
  activeNav();
  reveals();
  quickbar();
  forms();
})();
