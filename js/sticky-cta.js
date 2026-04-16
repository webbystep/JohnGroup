(function () {
  'use strict';

  // Only show on narrow viewports (mobile)
  var MOBILE_BREAKPOINT = 767;
  var SHOW_AFTER_SCROLL = 400; // px

  var LABELS = {
    hu: { text: 'Ajánlatkérés', href: '/#ajanlatkeres' },
    en: { text: 'Request a quote', href: '/en/#request-quote' },
    de: { text: 'Angebot anfordern', href: '/de/#angebot' },
  };

  var LABELS_BACK = {
    hu: { text: 'Vissza a kezdőlapra', href: '/' },
    en: { text: 'Back to homepage', href: '/en/' },
    de: { text: 'Zurück zur Startseite', href: '/de/' },
  };

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getLang() {
    return (document.documentElement.lang || 'hu').toLowerCase().slice(0, 2);
  }

  function isLegalPage() {
    // Legal pages don't contain the quote form anchor; show back-home CTA instead
    return !document.querySelector(
      '#ajanlatkeres, #request-quote, #angebot, .cta-section'
    );
  }

  function injectStyles() {
    if (document.getElementById('jg-sticky-cta-styles')) return;
    var style = document.createElement('style');
    style.id = 'jg-sticky-cta-styles';
    style.textContent =
      // Wrapper anchors the CTA with navy safe-zone underneath (prevents iOS bottom-chrome recoloring to cyan)
      '.jg-sticky-cta-wrap{position:fixed;left:0;right:0;bottom:0;z-index:9997;background:#162734;padding:10px 12px calc(10px + env(safe-area-inset-bottom));display:none;pointer-events:none;opacity:0;transform:translateY(20px);transition:opacity .25s ease,transform .25s ease}' +
      '.jg-sticky-cta-wrap.show{opacity:1;transform:translateY(0);pointer-events:auto}' +
      '@media (max-width:767px){.jg-sticky-cta-wrap{display:block}}' +
      '.jg-sticky-cta-wrap a{display:flex;align-items:center;justify-content:center;width:100%;height:50px;background:#00ace8;color:#fff;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:15px;font-weight:500;clip-path:polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px));transition:opacity .15s}' +
      '.jg-sticky-cta-wrap a:hover{opacity:.9}' +
      '.jg-sticky-cta-wrap a:active{opacity:.8}';
    document.head.appendChild(style);
  }

  function render() {
    injectStyles();
    var lang = getLang();
    var source = isLegalPage() ? LABELS_BACK : LABELS;
    var t = source[lang] || source.hu;

    var wrap = document.createElement('div');
    wrap.className = 'jg-sticky-cta-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<a href="' + t.href + '"><span>' + t.text + '</span></a>';
    document.body.appendChild(wrap);

    var legalPage = isLegalPage();
    function update() {
      if (!isMobile()) {
        wrap.classList.remove('show');
        wrap.setAttribute('aria-hidden', 'true');
        return;
      }
      var y = window.scrollY || window.pageYOffset || 0;
      // On index pages, hide near bottom to avoid doubling with actual form.
      // On legal pages, keep visible so back-home CTA is always reachable.
      var nearBottom = !legalPage && window.innerHeight + y >= document.body.scrollHeight - 300;
      if (y > SHOW_AFTER_SCROLL && !nearBottom) {
        if (!wrap.classList.contains('show')) {
          wrap.classList.add('show');
          wrap.setAttribute('aria-hidden', 'false');
        }
      } else {
        if (wrap.classList.contains('show')) {
          wrap.classList.remove('show');
          wrap.setAttribute('aria-hidden', 'true');
        }
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
