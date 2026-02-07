/**
 * Just Jazz — Queue screen
 */
(function () {
  function render(onTrackSelect) {
    var listEl = document.querySelector('[data-queue-list]');
    if (!listEl) return;
    var queue = window.JustJazzPlayer ? JustJazzPlayer.getPlaylist() : [];
    if (window.JustJazzPlaylist) {
      JustJazzPlaylist.renderTracks(listEl, queue, onTrackSelect, null);
    }
  }

  window.JustJazzQueue = { render };
})();
