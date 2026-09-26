/* Course password: asked once per browser, then remembered. Loaded synchronously in <head>. */
(function () {
  'use strict';
  var SERVICE = 'https://script.google.com/macros/s/AKfycbyjYN1Vv_4ZfQ24rw-F-kbR8t_4gCmbFZDhn4MEXt8OPMt9-wjSgMR5-FaqJN4pFFmXvg/exec';
  var KEY = 'rachel-sat-trusted-browser-v1';
  var root = document.documentElement, memory = '', waiting = [], embedded = false;
  try { embedded = window.top !== window && Boolean(window.parent.document); } catch (e) { embedded = false; }

  function read() { try { return localStorage.getItem(KEY) || memory; } catch (e) { return memory; } }
  function write(t) { memory = t; try { localStorage.setItem(KEY, t); } catch (e) {} }
  function clear() { memory = ''; try { localStorage.removeItem(KEY); } catch (e) {} }
  function ask(action, payload) {
    return fetch(SERVICE, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action }, payload)) })
      .then(function (r) { if (!r.ok) throw new Error('unavailable'); return r.json(); });
  }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function withHandoff(url, token) {
    var clean = String(url).split('#')[0];
    return token && clean.indexOf('script.google.com/macros/s/') >= 0 ? clean + '#rt=' + encodeURIComponent(token) : url;
  }
  function decorate(token) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="script.google.com/macros/s/"]'), function (a) { a.href = withHandoff(a.href, token); });
  }

  var style = document.createElement('style');
  style.textContent = 'html.rg-pending body{visibility:hidden}body.rg-locked{overflow:hidden}' +
    '.rg-gate{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:#edf3f6;visibility:visible;font:17px/1.6 system-ui,sans-serif;color:#213b50}' +
    '.rg-card{width:min(420px,100%);padding:32px;border:1px solid #d0dde7;border-radius:14px;background:#fff;box-shadow:0 18px 50px rgba(33,59,80,.12)}' +
    '.rg-card p{margin:0 0 18px;color:#587184}.rg-card .rg-kicker{margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#597489}' +
    '.rg-card h1{margin:0 0 10px;font:700 32px/1.2 Georgia,serif;color:#213b50}.rg-card label{display:block;margin-bottom:6px;font-size:14px;font-weight:700}' +
    '.rg-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.rg-row input{width:100%;min-height:46px;padding:10px 12px;border:1px solid #9eb5c6;border-radius:8px;font:inherit;color:#213b50}' +
    '.rg-row button{min-height:46px;padding:10px 18px;border:0;border-radius:8px;background:#164865;color:#fff;font:600 15px system-ui;cursor:pointer}.rg-row button:disabled{opacity:.6;cursor:wait}' +
    '.rg-error{min-height:1.5em;margin:10px 0 0!important;color:#a33a2f!important;font-size:14px}' +
    '@media(max-width:480px){.rg-card{padding:26px 20px}.rg-row{grid-template-columns:1fr}}@media print{.rg-gate{display:none!important}}';
  (document.head || root).appendChild(style);

  function grant(token) {
    write(token);
    ready(function () {
      root.classList.remove('rg-pending');
      document.body.classList.remove('rg-locked');
      var g = document.querySelector('.rg-gate'); if (g) g.remove();
      Array.prototype.forEach.call(document.body.children, function (n) { n.inert = false; });
      decorate(token);
      var list = waiting; waiting = [];
      list.forEach(function (fn) { fn(token); });
    });
  }

  function showGate() {
    ready(function () {
      if (document.querySelector('.rg-gate')) return;
      Array.prototype.forEach.call(document.body.children, function (n) { n.inert = true; });
      document.body.classList.add('rg-locked');
      var gate = document.createElement('div');
      gate.className = 'rg-gate'; gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-modal', 'true'); gate.setAttribute('aria-labelledby', 'rg-title');
      gate.innerHTML = '<form class="rg-card"><p class="rg-kicker">Rachel · SAT Reading &amp; Writing</p><h1 id="rg-title">Welcome</h1><p>Enter your course password to continue.</p>' +
        '<label for="rg-word">Password</label><div class="rg-row"><input id="rg-word" type="password" autocomplete="current-password" required><button type="submit">Continue</button></div>' +
        '<p class="rg-error" role="alert" aria-live="polite"></p></form>';
      document.body.appendChild(gate);
      root.classList.remove('rg-pending');
      var form = gate.querySelector('form'), input = gate.querySelector('input'), button = gate.querySelector('button'), error = gate.querySelector('.rg-error');
      input.focus();
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        error.textContent = ''; button.disabled = true; button.textContent = 'Opening…';
        ask('trust', { word: input.value }).then(function (r) {
          if (r && r.ok && r.token) { grant(r.token); return; }
          error.textContent = r && r.error === 'busy' ? 'Too many tries. Please wait a few minutes and try again.' : 'That password doesn’t match. Please try again.';
          input.select(); button.disabled = false; button.textContent = 'Continue';
        }).catch(function () {
          error.textContent = 'We couldn’t connect just now. Please check your connection and try again.';
          button.disabled = false; button.textContent = 'Try again';
        });
      });
    });
  }

  // Page code runs fn(token) once this browser is remembered (immediately if it already is).
  window.RachelAccess = {
    whenTrusted: function (fn) { var t = read(); if (t && !root.classList.contains('rg-pending') && !document.querySelector('.rg-gate')) fn(t); else waiting.push(fn); },
    withHandoff: function (url) { return withHandoff(url, read()); }
  };

  // Links opened in a new tab or window keep the handoff even when added after load.
  document.addEventListener('click', function (event) {
    var a = event.target && event.target.closest && event.target.closest('a[href*="script.google.com/macros/s/"]');
    var t = read(); if (a && t) a.href = withHandoff(a.href, t);
  }, true);

  root.classList.add('rg-pending');

  var preview = '';
  try {
    var hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    preview = hash.get('rachel-preview') || '';
    if (preview) history.replaceState(null, '', location.pathname + location.search);
  } catch (e) { preview = ''; }

  var saved = read();
  if (saved) {
    grant(saved);
    if (!embedded) ask('check', { token: saved }).then(function (r) { if (r && r.ok === false && r.error === 'unknown') { clear(); root.classList.add('rg-pending'); showGate(); } }).catch(function () {});
    return;
  }
  if (preview) {
    ask('redeem', { preview: preview }).then(function (r) { if (r && r.ok && r.token) grant(r.token); else showGate(); }).catch(showGate);
    return;
  }
  if (embedded) {
    // Inside the class page: the page itself asks once; this frame opens when that answer arrives.
    var poll = setInterval(function () { var t = read(); if (t) { clearInterval(poll); grant(t); } }, 700);
    window.addEventListener('storage', function (event) { if (event.key === KEY && event.newValue) { clearInterval(poll); grant(event.newValue); } });
    return;
  }
  showGate();
})();
