/**
 * Just Jazz — YouTube API client
 * Centralizes all YouTube-related API calls and fetches.
 */
(function () {
  var THUMB_BASE = JUST_JAZZ.YOUTUBE_THUMB_BASE;
  var THUMB_SIZE = JUST_JAZZ.YOUTUBE_THUMB_SIZE || 'mqdefault';
  var NOEMBED_URL = 'https://noembed.com/embed';

  var ytPlayer = null;
  var onStateChangeCb = null;

  function getThumbUrl(youtubeId, size) {
    if (!youtubeId) return '';
    var s = size || THUMB_SIZE;
    return THUMB_BASE + youtubeId + '/' + s + '.jpg';
  }

  function getVideoUrl(youtubeId) {
    if (!youtubeId) return '#';
    return 'https://www.youtube.com/watch?v=' + youtubeId;
  }

  function fetchChannelUrl(videoId) {
    var url = getVideoUrl(videoId);
    return fetch(NOEMBED_URL + '?url=' + encodeURIComponent(url))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.author_url) {
          return data.author_url + '/videos';
        }
        return url;
      })
      .catch(function () {
        return url;
      });
  }

  function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
      height: 1,
      width: 1,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onStateChange: function (e) {
          if (onStateChangeCb) onStateChangeCb(e.data);
        }
      }
    });
    if (window.JustJazzRainPlayer) JustJazzRainPlayer.onAPIReady();
  }

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

  function initPlayer(containerId, onStateChange) {
    onStateChangeCb = onStateChange;
  }

  function loadVideo(videoId) {
    if (!ytPlayer || !ytPlayer.loadVideoById) return;
    ytPlayer.loadVideoById(videoId);
  }

  function play() {
    if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
  }

  function pause() {
    if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
  }

  function stop() {
    if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
  }

  function seekTo(seconds) {
    if (ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(seconds);
  }

  function setVolume(value) {
    if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(value);
  }

  function getPlayerState() {
    return ytPlayer && ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
  }

  function getCurrentTime() {
    return ytPlayer && ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
  }

  function getDuration() {
    return ytPlayer && ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
  }

  function getVideoData() {
    return ytPlayer && ytPlayer.getVideoData ? ytPlayer.getVideoData() : null;
  }

  window.JustJazzYouTubeClient = {
    getThumbUrl: getThumbUrl,
    getVideoUrl: getVideoUrl,
    fetchChannelUrl: fetchChannelUrl,
    initPlayer: initPlayer,
    loadVideo: loadVideo,
    play: play,
    pause: pause,
    stop: stop,
    seekTo: seekTo,
    setVolume: setVolume,
    getPlayerState: getPlayerState,
    getCurrentTime: getCurrentTime,
    getDuration: getDuration,
    getVideoData: getVideoData,
    get player() { return ytPlayer; }
  };
})();
