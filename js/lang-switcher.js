(function () {
  'use strict';

  function init() {
    var switchers = document.querySelectorAll('.lang-switcher');
    if (!switchers.length) return;

    switchers.forEach(function (ls) {
      var btn = ls.querySelector('.lang-switcher-btn');
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = ls.getAttribute('data-open') === 'true';
        ls.setAttribute('data-open', isOpen ? 'false' : 'true');
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
    });

    document.addEventListener('click', function (e) {
      switchers.forEach(function (ls) {
        if (ls.getAttribute('data-open') !== 'true') return;
        if (ls.contains(e.target)) return;
        ls.setAttribute('data-open', 'false');
        var btn = ls.querySelector('.lang-switcher-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      switchers.forEach(function (ls) {
        if (ls.getAttribute('data-open') !== 'true') return;
        ls.setAttribute('data-open', 'false');
        var btn = ls.querySelector('.lang-switcher-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
