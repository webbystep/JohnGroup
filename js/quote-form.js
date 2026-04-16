(function () {
  'use strict';

  function init() {
    var form = document.querySelector('.contact10_form');
    if (!form) return;

    var lang = (document.documentElement.lang || 'hu').toLowerCase().slice(0, 2);
    var nameInput = form.querySelector('input[type="text"]');
    var emailInput = form.querySelector('input[type="email"]');
    var phoneInput = form.querySelector('input[type="tel"]');
    var messageInput = form.querySelector('textarea');
    var submitBtn = form.querySelector('input[type="submit"]');
    var container = form.parentNode;
    var doneEl = container.querySelector('.w-form-done');
    var failEl = container.querySelector('.w-form-fail');

    if (!nameInput || !emailInput || !phoneInput || !messageInput || !submitBtn) return;

    form.setAttribute('method', 'post');
    form.setAttribute('action', '/api/contact');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var originalValue = submitBtn.value;
      var waitValue = submitBtn.getAttribute('data-wait') || 'Please wait...';
      submitBtn.value = waitValue;
      submitBtn.disabled = true;

      // Hide any previous messages
      if (doneEl) doneEl.style.display = 'none';
      if (failEl) failEl.style.display = 'none';

      var payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim(),
        lang: lang,
        page: window.location.pathname,
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function () {
          form.style.display = 'none';
          if (doneEl) doneEl.style.display = 'block';
        })
        .catch(function () {
          if (failEl) failEl.style.display = 'block';
        })
        .finally(function () {
          submitBtn.value = originalValue;
          submitBtn.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
