/**
 * Just Jazz — Now playing mini bar
 */
(function () {
  var barEl = null;
  var trackEl = null;
  var playIconEl = null;
  var pauseIconEl = null;
  var playBtnEl = null;

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
    if (!barEl) return;
    if (playIconEl) {
      if (isPlaying) {
        playIconEl.setAttribute('hidden', '');
      } else {
        playIconEl.removeAttribute('hidden');
      }
    }
    if (pauseIconEl) {
      if (isPlaying) {
        pauseIconEl.removeAttribute('hidden');
      } else {
        pauseIconEl.setAttribute('hidden', '');
      }
    }
    if (playBtnEl) playBtnEl.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproduzir');
  }

  function init(onRewind, onPrev, onNext, onForward, onPlayPause, onStop, onBarClick) {
    var el = getEl();
    if (!el.bar) return;

    playIconEl = el.bar.querySelector('.now-playing-bar__icon-play');
    pauseIconEl = el.bar.querySelector('.now-playing-bar__icon-pause');
    playBtnEl = el.bar.querySelector('[data-action="mini-play-pause"]');

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

  var rainBtn = null;
  var rainList = null;

  function initRainPicker(onRainSelect) {
    var bar = document.getElementById('now-playing-bar');
    if (!bar) return;
    rainBtn = bar.querySelector('[data-action="mini-rain"]');
    rainList = bar.querySelector('.now-playing-bar__rain-list');
    if (!rainBtn || !rainList) return;

    var sounds = (window.JUST_JAZZ && window.JUST_JAZZ.RAIN_SOUNDS) || [];
    sounds.forEach(function (sound) {
      var li = document.createElement('li');
      li.className = 'now-playing-bar__rain-item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-rain-id', sound.id);
      li.setAttribute('aria-selected', sound.id === 'none' ? 'true' : 'false');
      li.textContent = sound.name;
      if (sound.id === 'none') li.classList.add('now-playing-bar__rain-item--active');
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        rainList.querySelectorAll('.now-playing-bar__rain-item').forEach(function (el) {
          el.classList.remove('now-playing-bar__rain-item--active');
          el.setAttribute('aria-selected', 'false');
        });
        li.classList.add('now-playing-bar__rain-item--active');
        li.setAttribute('aria-selected', 'true');
        closeList();
        if (onRainSelect) onRainSelect(sound);
      });
      rainList.appendChild(li);
    });

    rainBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = !rainList.hidden;
      if (isOpen) closeList();
      else openList();
    });

    document.addEventListener('click', function (e) {
      if (!rainList.hidden && rainBtn && !rainBtn.closest('.now-playing-bar__rain-wrap').contains(e.target)) {
        closeList();
      }
    });
  }

  function openList() {
    if (!rainList || !rainBtn) return;
    rainList.hidden = false;
    rainBtn.setAttribute('aria-expanded', 'true');
  }

  function closeList() {
    if (!rainList || !rainBtn) return;
    rainList.hidden = true;
    rainBtn.setAttribute('aria-expanded', 'false');
  }

  function setRainActive(isActive) {
    if (!rainBtn) rainBtn = document.querySelector('[data-action="mini-rain"]');
    if (rainBtn) rainBtn.classList.toggle('is-active', !!isActive);
  }

  window.JustJazzNowPlayingBar = {
    show: show,
    hide: hide,
    updateTrackName: updateTrackName,
    setPlayPauseIcon: setPlayPauseIcon,
    init: init,
    initRainPicker: initRainPicker,
    setRainActive: setRainActive
  };
})();
