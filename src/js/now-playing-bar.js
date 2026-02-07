/**
 * Just Jazz — Now playing mini bar
 */
(function () {
  var barEl = null;
  var trackEl = null;

  function getEl() {
    if (!barEl) barEl = document.getElementById('now-playing-bar');
    if (!trackEl) trackEl = document.querySelector('[data-now-playing-track]');
    return { bar: barEl, track: trackEl };
  }

  function show(trackName) {
    var el = getEl();
    if (!el.bar) return;
    el.bar.hidden = false;
    el.bar.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-now-playing');
    updateTrackName(trackName);
  }

  function hide() {
    var el = getEl();
    if (!el.bar) return;
    el.bar.hidden = true;
    el.bar.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-now-playing');
  }

  function updateTrackName(name) {
    var el = getEl();
    if (el.track) el.track.textContent = name || '';
  }

  function setPlayPauseIcon(isPlaying) {
    var bar = document.getElementById('now-playing-bar');
    if (!bar) return;
    var playIcon = bar.querySelector('.now-playing-bar__icon-play');
    var pauseIcon = bar.querySelector('.now-playing-bar__icon-pause');
    var playBtn = bar.querySelector('[data-action="mini-play-pause"]');
    if (playIcon) {
      if (isPlaying) {
        playIcon.setAttribute('hidden', '');
      } else {
        playIcon.removeAttribute('hidden');
      }
    }
    if (pauseIcon) {
      if (isPlaying) {
        pauseIcon.removeAttribute('hidden');
      } else {
        pauseIcon.setAttribute('hidden', '');
      }
    }
    if (playBtn) playBtn.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproduzir');
  }

  function init(onRewind, onPrev, onNext, onForward, onPlayPause, onStop, onBarClick) {
    var el = getEl();
    if (!el.bar) return;

    hide();

    el.bar.addEventListener('click', function (e) {
      if (!e.target.closest('[data-action]')) {
        if (onBarClick) onBarClick();
        return;
      }
    });

    var rewindBtn = el.bar.querySelector('[data-action="mini-rewind-10"]');
    var prevBtn = el.bar.querySelector('[data-action="mini-prev"]');
    var nextBtn = el.bar.querySelector('[data-action="mini-next"]');
    var forwardBtn = el.bar.querySelector('[data-action="mini-forward-10"]');
    var playBtn = el.bar.querySelector('[data-action="mini-play-pause"]');
    var stopBtn = el.bar.querySelector('[data-action="mini-stop"]');

    if (rewindBtn) rewindBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onRewind) onRewind(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onPrev) onPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onNext) onNext(); });
    if (forwardBtn) forwardBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onForward) onForward(); });
    if (playBtn) playBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onPlayPause) onPlayPause(); });
    if (stopBtn) stopBtn.addEventListener('click', function (e) { e.stopPropagation(); if (onStop) onStop(); });
  }

  window.JustJazzNowPlayingBar = {
    show: show,
    hide: hide,
    updateTrackName: updateTrackName,
    setPlayPauseIcon: setPlayPauseIcon,
    init: init
  };
})();
