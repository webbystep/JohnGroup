(function () {
  'use strict';

  var DISMISS_KEY = 'jg-lang-suggest-dismissed-v1';

  var TR = {
    hu: { label: 'magyar', switch: 'Váltás magyar nyelvre', close: 'Bezárás', suffix: 'nyelven is olvashatja' },
    en: { label: 'English', switch: 'Switch to English', close: 'Close', suffix: 'is also available in' },
    de: { label: 'Deutsch', switch: 'Auf Deutsch wechseln', close: 'Schließen', suffix: 'ist auch verfügbar auf' },
  };

  // Map between page paths across languages
  var PATH_MAP = {
    hu: {
      '/': { en: '/en/', de: '/de/' },
      '/impresszum': { en: '/en/imprint', de: '/de/impressum' },
      '/privacy-policy': { en: '/en/privacy-policy', de: '/de/datenschutz' },
      '/cookie': { en: '/en/cookie-policy', de: '/de/cookie-richtlinie' },
    },
    en: {
      '/en/': { hu: '/', de: '/de/' },
      '/en/imprint': { hu: '/impresszum', de: '/de/impressum' },
      '/en/privacy-policy': { hu: '/privacy-policy', de: '/de/datenschutz' },
      '/en/cookie-policy': { hu: '/cookie', de: '/de/cookie-richtlinie' },
    },
    de: {
      '/de/': { hu: '/', en: '/en/' },
      '/de/impressum': { hu: '/impresszum', en: '/en/imprint' },
      '/de/datenschutz': { hu: '/privacy-policy', en: '/en/privacy-policy' },
      '/de/cookie-richtlinie': { hu: '/cookie', en: '/en/cookie-policy' },
    },
  };

  function getCurrentLang() {
    return (document.documentElement.lang || 'hu').toLowerCase().slice(0, 2);
  }

  function getBrowserLang() {
    var langs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
    for (var i = 0; i < langs.length; i++) {
      var code = (langs[i] || '').toLowerCase().slice(0, 2);
      if (code === 'hu' || code === 'en' || code === 'de') return code;
    }
    return null;
  }

  function isDismissed() {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch (e) {}
  }

  function getTargetPath(currentLang, suggestedLang) {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path !== '/') {
      // Try raw path, then trailing-stripped path
      var map = PATH_MAP[currentLang] && (PATH_MAP[currentLang][path] || PATH_MAP[currentLang][path + '/']);
      if (map && map[suggestedLang]) return map[suggestedLang];
    } else {
      var root = PATH_MAP[currentLang] && PATH_MAP[currentLang]['/'];
      if (root && root[suggestedLang]) return root[suggestedLang];
    }
    // Fallback: language home
    return suggestedLang === 'hu' ? '/' : '/' + suggestedLang + '/';
  }

  function injectStyles() {
    if (document.getElementById('jg-lang-suggest-styles')) return;
    var style = document.createElement('style');
    style.id = 'jg-lang-suggest-styles';
    style.textContent =
      '.jg-lang-suggest{position:fixed;left:20px;right:20px;top:20px;max-width:420px;margin:0 auto;background:#162734;color:#fff;padding:12px 14px 12px 16px;z-index:9998;box-shadow:0 12px 32px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);font-family:Inter,system-ui,sans-serif;display:flex;gap:10px;align-items:center;opacity:0;transform:translateY(-12px);transition:opacity .25s ease,transform .25s ease}' +
      '.jg-lang-suggest.show{opacity:1;transform:translateY(0)}' +
      '.jg-lang-suggest svg{flex-shrink:0;width:18px;height:18px;color:rgba(255,255,255,.75)}' +
      '.jg-lang-suggest-text{flex:1;font-size:13px;line-height:1.45;color:rgba(255,255,255,.85)}' +
      '.jg-lang-suggest-action{background:#00ace8;color:#fff;text-decoration:none;font-size:13px;font-weight:500;padding:8px 14px;white-space:nowrap;clip-path:polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px));transition:opacity .2s}' +
      '.jg-lang-suggest-action:hover{opacity:.85}' +
      '.jg-lang-suggest-close{background:transparent;border:0;color:rgba(255,255,255,.5);cursor:pointer;padding:6px;display:flex;align-items:center;transition:color .2s}' +
      '.jg-lang-suggest-close:hover{color:#fff}' +
      '.jg-lang-suggest-close svg{width:14px;height:14px;color:inherit}' +
      '@media (max-width: 480px){.jg-lang-suggest{top:12px;left:12px;right:12px;padding:10px 10px 10px 14px;gap:8px}.jg-lang-suggest-text{font-size:12.5px}.jg-lang-suggest-action{font-size:12.5px;padding:7px 12px}}';
    document.head.appendChild(style);
  }

  function render(currentLang, suggestedLang, targetHref) {
    injectStyles();
    var t = TR[suggestedLang];
    if (!t) return;

    var banner = document.createElement('div');
    banner.className = 'jg-lang-suggest';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', t.switch);
    banner.setAttribute('lang', suggestedLang);

    banner.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>' +
      '</svg>' +
      '<div class="jg-lang-suggest-text">' +
      t.switch +
      '</div>' +
      '<a class="jg-lang-suggest-action" href="' +
      targetHref +
      '" rel="alternate" hreflang="' +
      suggestedLang +
      '">' +
      suggestedLang.toUpperCase() +
      '</a>' +
      '<button class="jg-lang-suggest-close" type="button" aria-label="' +
      t.close +
      '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' +
      '</svg>' +
      '</button>';

    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      setTimeout(function () {
        banner.classList.add('show');
      }, 60);
    });

    function hide() {
      dismiss();
      banner.classList.remove('show');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 250);
    }

    banner.querySelector('.jg-lang-suggest-close').addEventListener('click', hide);
    banner.querySelector('.jg-lang-suggest-action').addEventListener('click', function () {
      dismiss();
    });
  }

  function init() {
    if (isDismissed()) return;

    var currentLang = getCurrentLang();
    var browserLang = getBrowserLang();

    if (!browserLang) return;
    if (browserLang === currentLang) return;

    var targetHref = getTargetPath(currentLang, browserLang);
    if (!targetHref) return;

    render(currentLang, browserLang, targetHref);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
