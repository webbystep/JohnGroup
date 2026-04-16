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

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getLang() {
    return (document.documentElement.lang || 'hu').toLowerCase().slice(0, 2);
  }

  function injectStyles() {
    if (document.getElementById('jg-sticky-cta-styles')) return;
    var style = document.createElement('style');
    style.id = 'jg-sticky-cta-styles';
    style.textContent =
      '.jg-sticky-cta{position:fixed;left:12px;right:12px;bottom:12px;z-index:9997;display:none;pointer-events:none;opacity:0;transform:translateY(16px);transition:opacity .25s ease,transform .25s ease}' +
      '.jg-sticky-cta.show{opacity:1;transform:translateY(0);pointer-events:auto}' +
      '@media (max-width:767px){.jg-sticky-cta{display:block}}' +
      '.jg-sticky-cta a{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;background:#00ace8;color:#fff;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:15px;font-weight:500;clip-path:polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px));box-shadow:0 8px 24px rgba(0,0,0,.28);transition:opacity .15s}' +
      '.jg-sticky-cta a:hover{opacity:.9}' +
      '.jg-sticky-cta a:active{opacity:.8}' +
      '.jg-sticky-cta svg{width:16px;height:16px;flex-shrink:0}';
    document.head.appendChild(style);
  }

  function render() {
    injectStyles();
    var lang = getLang();
    var t = LABELS[lang] || LABELS.hu;

    var wrap = document.createElement('div');
    wrap.className = 'jg-sticky-cta';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<a href="' + t.href + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
      '<span>' + t.text + '</span>' +
      '</a>';
    document.body.appendChild(wrap);

    function update() {
      if (!isMobile()) {
        wrap.classList.remove('show');
        wrap.setAttribute('aria-hidden', 'true');
        return;
      }
      var y = window.scrollY || window.pageYOffset || 0;
      // Hide when near bottom (approaching the actual form)
      var nearBottom = (window.innerHeight + y) >= (document.body.scrollHeight - 300);
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
