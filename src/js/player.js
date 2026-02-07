/**
 * Just Jazz — YouTube audio player (playlist/queue logic)
 */
(function () {
  var YTClient = window.JustJazzYouTubeClient;

  let currentTrackIndex = 0;
  let playlist = [];
  let onStateChange = null;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  YTClient.initPlayer('youtube-player', function (state) {
    if (onStateChange) onStateChange(state);
  });

  function loadTrack(track) {
    if (!track || !track.youtubeId) return;
    YTClient.loadVideo(track.youtubeId);
  }

  function setPlaylist(tracks, index) {
    playlist = Array.isArray(tracks) ? tracks.slice() : [];
    currentTrackIndex = Math.max(0, Math.min(index, Math.max(0, playlist.length - 1)));
  }

  function addToQueue(track) {
    if (!track) return;
    var exists = playlist.some(function (t) { return t.id === track.id; });
    if (!exists) playlist.push(track);
  }

  function getPlaylist() {
    return playlist.slice();
  }

  function getCurrentTrack() {
    return playlist[currentTrackIndex] || null;
  }

  function play() {
    YTClient.play();
  }

  function pause() {
    YTClient.pause();
  }

  function stop() {
    YTClient.stop();
    playlist = [];
    currentTrackIndex = 0;
  }

  function togglePlayPause() {
    var state = YTClient.getPlayerState();
    if (state === 1) {
      pause();
    } else {
      play();
    }
  }

  function next() {
    if (playlist.length === 0) return null;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    var track = playlist[currentTrackIndex];
    loadTrack(track);
    return track;
  }

  function prev() {
    if (playlist.length === 0) return;
    var state = YTClient.getPlayerState();
    if (state === 1 && YTClient.getCurrentTime() > 3) {
      YTClient.seekTo(0);
      return getCurrentTrack();
    }
    currentTrackIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1;
    loadTrack(playlist[currentTrackIndex]);
    return playlist[currentTrackIndex];
  }

  function setOnStateChange(cb) {
    onStateChange = cb;
  }

  function getThumbUrl(youtubeId) {
    return YTClient.getThumbUrl(youtubeId, 'hqdefault');
  }

  window.JustJazzPlayer = {
    loadTrack,
    setPlaylist,
    addToQueue,
    getPlaylist,
    getCurrentTrack,
    play,
    pause,
    stop,
    togglePlayPause,
    next,
    prev,
    setOnStateChange,
    getThumbUrl,
    get ytPlayer() { return YTClient.player; }
  };
})();
