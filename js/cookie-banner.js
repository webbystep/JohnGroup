(function () {
  'use strict';

  var CONSENT_KEY = 'jg-cookie-consent-v1';
  var lang = (document.documentElement.lang || 'hu').toLowerCase().slice(0, 2);

  var T = {
    hu: {
      message:
        'Ez a weboldal sütiket (cookie-kat) használ a legjobb felhasználói élmény érdekében. Elfogadással hozzájárul a működési és elemzési sütik használatához.',
      policyLabel: 'Cookie nyilatkozat',
      policyHref: '/cookie',
      accept: 'Elfogadom',
      reject: 'Elutasítom',
    },
    en: {
      message:
        'This website uses cookies to provide the best experience. By accepting, you consent to the use of functional and analytical cookies.',
      policyLabel: 'Cookie policy',
      policyHref: '/en/cookie-policy',
      accept: 'Accept',
      reject: 'Reject',
    },
    de: {
      message:
        'Diese Website verwendet Cookies, um das beste Nutzererlebnis zu bieten. Mit der Zustimmung erlauben Sie den Einsatz von Funktions- und Analyse-Cookies.',
      policyLabel: 'Cookie-Richtlinie',
      policyHref: '/de/cookie-richtlinie',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
    },
  };

  var t = T[lang] || T.hu;

  function hasConsent() {
    try {
      return !!localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return false;
    }
  }

  function saveConsent(choice) {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          choice: choice,
          necessary: true,
          functional: choice === 'accept',
          analytics: choice === 'accept',
          marketing: choice === 'accept',
          date: new Date().toISOString(),
        })
      );
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById('jg-cookie-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'jg-cookie-banner-styles';
    style.textContent =
      '.jg-cb{position:fixed;left:20px;right:20px;bottom:20px;max-width:680px;margin:0 auto;background:#162734;color:#fff;padding:22px 24px;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);font-family:Inter,system-ui,sans-serif;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap;opacity:0;transform:translateY(20px);transition:opacity .3s ease,transform .3s ease}' +
      '.jg-cb.jg-cb-show{opacity:1;transform:translateY(0)}' +
      '.jg-cb-text{flex:1;min-width:260px;font-size:14px;line-height:1.55;color:rgba(255,255,255,.82)}' +
      '.jg-cb-text a{color:#00ace8;text-decoration:underline;text-underline-offset:2px}' +
      '.jg-cb-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '.jg-cb-btn{font-family:inherit;font-size:14px;font-weight:500;padding:10px 22px;cursor:pointer;border:none;transition:opacity .2s ease,background .2s ease}' +
      '.jg-cb-btn.jg-cb-accept{background:#00ace8;color:#fff;clip-path:polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px))}' +
      '.jg-cb-btn.jg-cb-accept:hover{opacity:.85}' +
      '.jg-cb-btn.jg-cb-reject{background:transparent;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.25)}' +
      '.jg-cb-btn.jg-cb-reject:hover{color:#fff;border-color:rgba(255,255,255,.5)}' +
      '@media (max-width:640px){.jg-cb{left:12px;right:12px;bottom:12px;padding:18px;flex-direction:column;align-items:stretch}.jg-cb-actions{justify-content:flex-end}}';
    document.head.appendChild(style);
  }

  function render() {
    injectStyles();

    var banner = document.createElement('div');
    banner.className = 'jg-cb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    banner.innerHTML =
      '<div class="jg-cb-text">' +
      t.message +
      ' <a href="' +
      t.policyHref +
      '">' +
      t.policyLabel +
      '</a></div>' +
      '<div class="jg-cb-actions">' +
      '<button type="button" class="jg-cb-btn jg-cb-reject">' +
      t.reject +
      '</button>' +
      '<button type="button" class="jg-cb-btn jg-cb-accept">' +
      t.accept +
      '</button>' +
      '</div>';

    document.body.appendChild(banner);

    // Show after a small delay for smooth transition
    requestAnimationFrame(function () {
      setTimeout(function () {
        banner.classList.add('jg-cb-show');
      }, 50);
    });

    function dismiss(choice) {
      saveConsent(choice);
      banner.classList.remove('jg-cb-show');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
        try { window.dispatchEvent(new CustomEvent('jg-cookie-dismissed')); } catch (e) {}
      }, 300);
    }

    banner.querySelector('.jg-cb-accept').addEventListener('click', function () {
      dismiss('accept');
    });
    banner.querySelector('.jg-cb-reject').addEventListener('click', function () {
      dismiss('reject');
    });
  }

  function init() {
    if (hasConsent()) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render);
    } else {
      render();
    }
  }

  init();
})();
