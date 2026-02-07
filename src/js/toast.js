/**
 * Just Jazz — Toast notifications
 */
(function () {
  var container = null;
  var hideTimer = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, duration) {
    duration = duration || 2500;
    var c = getContainer();
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    c.innerHTML = '';
    c.appendChild(toast);
    c.classList.remove('toast-container--visible');
    c.offsetHeight;
    c.classList.add('toast-container--visible');
    hideTimer = setTimeout(function () {
      c.classList.remove('toast-container--visible');
      hideTimer = null;
    }, duration);
  }

  window.JustJazzToast = { show };
})();
