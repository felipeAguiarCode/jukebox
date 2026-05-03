/**
 * Just Jazz — App entry
 */
(function () {
  const ROUTES = JUST_JAZZ.ROUTES;
  let tracks = [];

  function loadData() {
    return fetch('src/data/seed.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        tracks = data;
        return tracks;
      })
      .catch(function () {
        tracks = [];
        return tracks;
      });
  }

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.remove('screen--active');
      el.hidden = el.getAttribute('data-screen-id') !== screenId;
    });
    document.querySelectorAll('.screen[data-screen-id="' + screenId + '"]').forEach(function (el) {
      el.classList.add('screen--active');
      el.hidden = false;
    });
    document.body.setAttribute('data-screen', screenId);

    document.querySelectorAll('.nav__link').forEach(function (link) {
      var nav = link.getAttribute('data-nav');
      var isActive = (nav === ROUTES.HOME && screenId === ROUTES.HOME) ||
        (nav === ROUTES.SEARCH && screenId === ROUTES.SEARCH) ||
        (nav === ROUTES.QUEUE && screenId === ROUTES.QUEUE) ||
        (nav === ROUTES.SETTINGS && screenId === ROUTES.SETTINGS);
      link.classList.toggle('nav__link--active', !!isActive);
      link.setAttribute('aria-current', isActive ? 'page' : null);
    });
  }

  function getTracksRef() { return tracks; }
  function setTracksRef(t) { tracks = t; }

  var currentPlaylistMood = { moodId: null, moodType: null };
  var currentPlaylistSort = 'az';
  var previousScreen = null;

  function addToQueue(track) {
    JustJazzPlayer.addToQueue(track);
    JustJazzToast.show('Added to queue');
  }

  function openPlaylist(moodId, moodType) {
    currentPlaylistMood.moodId = moodId;
    currentPlaylistMood.moodType = moodType || 'category';
    JustJazzPlaylist.render(moodId, tracks, playTrack, currentPlaylistMood.moodType, addToQueue, currentPlaylistSort);
    showScreen(ROUTES.PLAYLIST);
  }

  function cyclePlaylistSort() {
    currentPlaylistSort = currentPlaylistSort === 'az' ? 'za' : 'az';
    JustJazzPlaylist.render(
      currentPlaylistMood.moodId,
      tracks,
      playTrack,
      currentPlaylistMood.moodType,
      addToQueue,
      currentPlaylistSort
    );
  }

  function playTrack(track, playlistTracks) {
    var list = playlistTracks;
    if (!list || list.length === 0) {
      var moodId = currentPlaylistMood.moodId || track.category || (track.genres && track.genres[0]) || 'blues';
      var moodType = currentPlaylistMood.moodType || 'category';
      list = tracks.filter(function (t) {
        if (moodType === 'genre') {
          return t.genres && t.genres.indexOf(moodId) >= 0;
        }
        return t.category === moodId;
      });
    }
    var index = list.findIndex(function (t) { return t.id === track.id; });
    JustJazzPlayer.setPlaylist(list, index >= 0 ? index : 0);
    JustJazzPlayer.loadTrack(track);
    JustJazzPlayer.play();
    JustJazzPlaying.updateUI(track);
    JustJazzPlaying.updateProgress(0, 0);
    JustJazzPlaying.setPlayPauseIcon(true);
    previousScreen = document.body.getAttribute('data-screen');
    showScreen(ROUTES.PLAYING);
    setTimeout(function () { JustJazzPlaying.triggerNeedleDrop(); }, 50);
  }

  function handleBack() {
    var screen = document.body.getAttribute('data-screen');
    if (screen === ROUTES.PLAYING && previousScreen) {
      showScreen(previousScreen);
    } else if (screen === ROUTES.PLAYLIST || screen === ROUTES.SEARCH || screen === ROUTES.QUEUE) {
      showScreen(ROUTES.HOME);
      JustJazzHome.resetCarouselScrolls();
    }
  }

  function delegateClick(e) {
    var navLink = e.target.closest('[data-nav]');
    if (navLink && navLink.classList.contains('nav__link')) {
      e.preventDefault();
      var nav = navLink.getAttribute('data-nav');
      if (nav === ROUTES.HOME) {
        showScreen(ROUTES.HOME);
        JustJazzHome.resetCarouselScrolls();
      } else if (nav === ROUTES.SEARCH) {
        showScreen(ROUTES.SEARCH);
        JustJazzSearch.init(tracks, function (track, filteredTracks) {
          playTrack(track, filteredTracks.length > 0 ? filteredTracks : null);
        }, addToQueue);
        setTimeout(function () { JustJazzSearch.focusInput(); }, 100);
      } else if (nav === ROUTES.QUEUE) {
        showScreen(ROUTES.QUEUE);
        JustJazzQueue.render(function (track) {
          var queue = JustJazzPlayer.getPlaylist();
          playTrack(track, queue.length > 0 ? queue : null);
        });
      } else if (nav === ROUTES.SETTINGS) {
        showScreen(ROUTES.SETTINGS);
      }
      return;
    }

    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');
    var moodId = target.getAttribute('data-mood-id');
    var moodType = target.getAttribute('data-mood-type') || 'category';
    if (action === 'open-playlist' && moodId) {
      e.preventDefault();
      openPlaylist(moodId, moodType);
    } else if (action === 'back') {
      e.preventDefault();
      handleBack();
    } else if (action === 'playlist-sort') {
      e.preventDefault();
      cyclePlaylistSort();
    } else if (action === 'search-sort') {
      e.preventDefault();
      JustJazzSearch.cycleSort();
    } else if (action === 'queue-play-all') {
      e.preventDefault();
      var queue = JustJazzPlayer.getPlaylist();
      if (queue.length > 0) {
        playTrack(queue[0], queue);
      }
    } else if (action === 'queue-reset') {
      e.preventDefault();
      JustJazzPlayer.stop();
      JustJazzNowPlayingBar.hide();
      if (document.body.getAttribute('data-screen') === ROUTES.PLAYING) {
        showScreen(ROUTES.QUEUE);
      }
      JustJazzQueue.render(function (track) {
        var queue = JustJazzPlayer.getPlaylist();
        playTrack(track, queue.length > 0 ? queue : null);
      });
    }
  }

  function start() {
    loadData().then(function (tracks) {
      JustJazzHome.init(tracks);
      JustJazzPlaying.init(null, function (track) {
        JustJazzPlaying.updateUI(track);
        JustJazzNowPlayingBar.updateTrackName(track.name);
      });
      JustJazzNowPlayingBar.init(
        function () {
          var current = JustJazzYouTubeClient.getCurrentTime();
          JustJazzYouTubeClient.seekTo(Math.max(0, current - 10));
        },
        function () {
          var track = JustJazzPlayer.prev();
          if (track) {
            JustJazzPlaying.updateUI(track);
            JustJazzNowPlayingBar.updateTrackName(track.name);
          }
        },
        function () {
          var track = JustJazzPlayer.next();
          if (track) {
            JustJazzPlaying.updateUI(track);
            JustJazzNowPlayingBar.updateTrackName(track.name);
          }
        },
        function () {
          var current = JustJazzYouTubeClient.getCurrentTime();
          var duration = JustJazzYouTubeClient.getDuration();
          if (duration <= 0) return;
          JustJazzYouTubeClient.seekTo(Math.min(duration, current + 10));
        },
        function () {
          var state = JustJazzYouTubeClient.getPlayerState();
          var willBePlaying = state !== 1;
          JustJazzPlaying.setPlayPauseIcon(willBePlaying);
          JustJazzNowPlayingBar.setPlayPauseIcon(willBePlaying);
          JustJazzPlayer.togglePlayPause();
        },
        function () {
          JustJazzPlayer.stop();
          JustJazzNowPlayingBar.hide();
          if (document.body.getAttribute('data-screen') === ROUTES.PLAYING) {
            showScreen(ROUTES.PLAYLIST);
          }
        },
        function () {
          var state = JustJazzYouTubeClient.getPlayerState();
          JustJazzPlaying.setPlayPauseIcon(state === 1);
          showScreen(ROUTES.PLAYING);
        }
      );

      JustJazzNowPlayingBar.initRainPicker(function (rainSound) {
        JustJazzRainPlayer.setSound(rainSound.videoId);
        if (JustJazzYouTubeClient.getPlayerState() === 1) JustJazzRainPlayer.play();
        JustJazzNowPlayingBar.setRainActive(rainSound.id !== 'none');
      });

      JustJazzSettings.init({ getTracks: getTracksRef, setTracks: setTracksRef });
    });

    document.addEventListener('click', delegateClick);
  }

  start();
})();
