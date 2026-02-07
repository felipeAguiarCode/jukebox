/**
 * Just Jazz — Playing screen
 */
(function () {
  var formatMoodName = JUST_JAZZ.formatMoodName;

  function updateUI(track) {
    const trackEl = document.querySelector('[data-player-track]');
    const artworkEl = document.querySelector('[data-player-artwork]');
    const img = artworkEl ? artworkEl.querySelector('img') : null;
    const youtubeLink = document.querySelector('[data-player-youtube-link]');

    if (trackEl) {
      var inner = trackEl.querySelector('.player__track-inner');
      var name = track.name || '';
      var escaped = document.createElement('span');
      escaped.textContent = name;
      var safe = escaped.innerHTML;
      if (inner) {
        inner.innerHTML = '<span class="player__track-text">' + safe + '</span>' +
          '<span class="player__track-sep" aria-hidden="true"> &nbsp;&bull;&nbsp; </span>' +
          '<span class="player__track-text">' + safe + '</span>';
        inner.classList.toggle('player__track-inner--scroll', name.length > 20);
      }
    }
    var channelEl = document.querySelector('[data-player-channel]');
    if (channelEl) {
      channelEl.textContent = '';
      channelEl.href = '#';
      channelEl.style.display = 'none';
    }
    if (img) {
      img.src = JustJazzPlayer.getThumbUrl(track.youtubeId);
      img.alt = track.name;
    }
    if (youtubeLink && track.youtubeId) {
      youtubeLink.href = JustJazzYouTubeClient.getVideoUrl(track.youtubeId);
    }
  }

  function updateProgress(current, total) {
    var barFill = document.querySelector('[data-player-bar-fill]');
    var barThumb = document.querySelector('[data-player-bar-thumb]');
    var currentEl = document.querySelector('[data-player-current]');
    var totalEl = document.querySelector('[data-player-total]');
    var pct = total > 0 ? (current / total * 100) : 0;

    if (barFill) barFill.style.width = pct + '%';
    if (barThumb) barThumb.style.left = pct + '%';
    if (currentEl) currentEl.textContent = formatTime(current);
    if (totalEl) totalEl.textContent = formatTime(total);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setArtworkSpin(isPlaying) {
    var artwork = document.querySelector('[data-player-artwork]');
    if (!artwork) return;
    if (isPlaying) {
      artwork.classList.add('player__artwork--playing');
    } else {
      artwork.classList.remove('player__artwork--playing');
    }
  }

  function triggerNeedleDrop() {
    var artwork = document.querySelector('[data-player-artwork]');
    if (!artwork) return;
    artwork.classList.remove('player__artwork--needle-drop');
    void artwork.offsetWidth;
    artwork.classList.add('player__artwork--needle-drop');
  }

  function updateChannelName(channelName, videoId) {
    var channelEl = document.querySelector('[data-player-channel]');
    if (channelEl) {
      channelEl.textContent = channelName ? 'Channel on YouTube: ' + channelName : '';
      channelEl.style.display = channelName ? 'inline' : 'none';
      if (channelName && videoId) {
        channelEl.href = JustJazzYouTubeClient.getVideoUrl(videoId);
        JustJazzYouTubeClient.fetchChannelUrl(videoId).then(function (url) {
          channelEl.href = url;
        });
      }
    }
  }

  function setPlayPauseIcon(isPlaying) {
    var playerScreen = document.querySelector('[data-screen-id="playing"]');
    if (!playerScreen) return;
    setArtworkSpin(isPlaying);
    var playIcon = playerScreen.querySelector('.player__icon-play');
    var pauseIcon = playerScreen.querySelector('.player__icon-pause');
    var playBtn = playerScreen.querySelector('[data-action="play-pause"]');
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

  function init(show, onTrackChange) {
    let progressInterval = null;

    JustJazzPlayer.setOnStateChange(function (state) {
      if (state === 0) {
        var nextTrack = JustJazzPlayer.next();
        if (nextTrack && onTrackChange) {
          onTrackChange(nextTrack);
          JustJazzPlayer.play();
        }
        return;
      }
      var isPlaying = state === 1;
      var hasTrack = (state >= 1 && state <= 5) && JustJazzPlayer.getCurrentTrack();
      setPlayPauseIcon(isPlaying);
      if (state === 5 || state === 1) {
        var track = JustJazzPlayer.getCurrentTrack();
        var data = JustJazzYouTubeClient.getVideoData();
        var channel = data && data.author;
        var videoId = track && track.youtubeId;
        updateChannelName(channel, videoId);
      }
      if (window.JustJazzNowPlayingBar) {
        JustJazzNowPlayingBar.setPlayPauseIcon(isPlaying);
        if (hasTrack) {
          JustJazzNowPlayingBar.show(hasTrack.name);
        } else {
          JustJazzNowPlayingBar.hide();
        }
      }
      if (state === 1) {
        progressInterval = setInterval(function () {
          var current = JustJazzYouTubeClient.getCurrentTime();
          var duration = JustJazzYouTubeClient.getDuration();
          if (duration > 0) {
            updateProgress(current, duration);
          }
        }, 500);
      } else {
        clearInterval(progressInterval);
      }
    });

    var playPauseBtn = document.querySelector('[data-action="play-pause"]');
    if (playPauseBtn) playPauseBtn.addEventListener('click', function () {
      var state = JustJazzYouTubeClient.getPlayerState();
      var willBePlaying = state !== 1;
      setPlayPauseIcon(willBePlaying);
      if (window.JustJazzNowPlayingBar) JustJazzNowPlayingBar.setPlayPauseIcon(willBePlaying);
      JustJazzPlayer.togglePlayPause();
    });

      function triggerSeekAnimation(seekForward) {
      var record = document.querySelector('.player__artwork-record');
      var artwork = document.querySelector('[data-player-artwork]');
      if (record && artwork) {
        artwork.classList.remove('player__artwork--playing');
        record.classList.remove('player__artwork-record--seek-forward', 'player__artwork-record--seek-backward');
        void record.offsetWidth;
        record.classList.add(seekForward ? 'player__artwork-record--seek-forward' : 'player__artwork-record--seek-backward');
        setTimeout(function () {
          record.classList.remove('player__artwork-record--seek-forward', 'player__artwork-record--seek-backward');
          if (JustJazzYouTubeClient.getPlayerState() === 1) artwork.classList.add('player__artwork--playing');
        }, 250);
      }
    }

    var rewindBtn = document.querySelector('[data-action="rewind-10"]');
    if (rewindBtn) rewindBtn.addEventListener('click', function () {
      var current = JustJazzYouTubeClient.getCurrentTime();
      JustJazzYouTubeClient.seekTo(Math.max(0, current - 10));
    });

    var prevBtn = document.querySelector('[data-action="prev"]');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      const track = JustJazzPlayer.prev();
      if (track && onTrackChange) onTrackChange(track);
    });

    var nextBtn = document.querySelector('[data-action="next"]');
    if (nextBtn) nextBtn.addEventListener('click', function () {
      const track = JustJazzPlayer.next();
      if (track && onTrackChange) onTrackChange(track);
    });

    var forwardBtn = document.querySelector('[data-action="forward-10"]');
    if (forwardBtn) forwardBtn.addEventListener('click', function () {
      var current = JustJazzYouTubeClient.getCurrentTime();
      var duration = JustJazzYouTubeClient.getDuration();
      if (duration <= 0) return;
      JustJazzYouTubeClient.seekTo(Math.min(duration, current + 10));
    });

    var progressBar = document.querySelector('[data-player-bar]');
    if (progressBar) {
      var barFill = progressBar.querySelector('[data-player-bar-fill]');
      var barThumb = progressBar.querySelector('[data-player-bar-thumb]');
      var currentEl = progressBar.closest('.player__progress')?.querySelector('[data-player-current]');
      var totalEl = progressBar.closest('.player__progress')?.querySelector('[data-player-total]');

      function getPctFromEvent(e) {
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var rect = progressBar.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      }

      function applyProgress(pct, duration) {
        var w = pct * 100;
        if (barFill) barFill.style.width = w + '%';
        if (barThumb) barThumb.style.left = w + '%';
        if (currentEl && duration) currentEl.textContent = formatTime(pct * duration);
      }

      function startDrag(e) {
        e.preventDefault();
        var duration = JustJazzYouTubeClient.getDuration();
        if (duration <= 0) return;
        var pct = getPctFromEvent(e);
        progressBar.classList.add('player__bar--dragging');
        applyProgress(pct, duration);

        function onMove(ev) {
          ev.preventDefault();
          var p = getPctFromEvent(ev);
          applyProgress(p, duration);
        }
        function onEnd(ev) {
          ev.preventDefault();
          progressBar.classList.remove('player__bar--dragging');
          var p = (ev.changedTouches && ev.changedTouches[0])
            ? getPctFromEvent({ clientX: ev.changedTouches[0].clientX })
            : getPctFromEvent(ev);
          var newTime = p * duration;
          var currentTime = JustJazzYouTubeClient.getCurrentTime();
          triggerSeekAnimation(newTime > currentTime);
          JustJazzYouTubeClient.seekTo(newTime);
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onEnd);
          document.removeEventListener('touchmove', onMove, { passive: false });
          document.removeEventListener('touchend', onEnd, { passive: false });
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd, { passive: false });
      }

      progressBar.addEventListener('mousedown', startDrag);
      progressBar.addEventListener('touchstart', startDrag, { passive: false });
    }
  }

  window.JustJazzPlaying = {
    updateUI,
    updateProgress,
    setPlayPauseIcon,
    triggerNeedleDrop,
    init
  };
})();
