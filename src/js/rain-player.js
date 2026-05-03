/**
 * Just Jazz — Rain ambient sound player
 * Manages a second hidden YouTube player for background rain sounds.
 */
(function () {
  var player = null;
  var currentVideoId = null;
  var shouldPlay = false;
  var volume = 50;

  function onAPIReady() {
    player = new YT.Player('rain-player', {
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
        onReady: function () {
          player.setVolume(volume);
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.ENDED && shouldPlay && currentVideoId) {
            player.seekTo(0);
            player.playVideo();
          }
        }
      }
    });
  }

  function setVolume(value) {
    volume = value;
    if (player && player.setVolume) player.setVolume(value);
  }

  function setSound(videoId) {
    currentVideoId = videoId || null;
    if (!player) return;
    if (!currentVideoId) {
      player.stopVideo();
      return;
    }
    if (shouldPlay) {
      player.loadVideoById(currentVideoId);
    } else {
      player.cueVideoById(currentVideoId);
    }
  }

  function prime() {
    if (!player || !currentVideoId) return;
    // Desbloqueia contexto de áudio iOS dentro do gesto do usuário.
    // playVideo() + pauseVideo() com delay registra o player sem iniciar de fato.
    player.playVideo();
    setTimeout(function () {
      if (!shouldPlay) player.pauseVideo();
    }, 200);
  }

  function play() {
    shouldPlay = true;
    if (player && currentVideoId) player.playVideo();
  }

  function pause() {
    shouldPlay = false;
    if (player) player.pauseVideo();
  }

  window.JustJazzRainPlayer = {
    onAPIReady: onAPIReady,
    setSound: setSound,
    setVolume: setVolume,
    prime: prime,
    play: play,
    pause: pause
  };
})();
