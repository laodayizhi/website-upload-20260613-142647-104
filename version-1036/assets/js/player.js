(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function readConfig() {
    var node = document.getElementById("player-config");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function attach(video, source) {
    if (!video || !source) {
      return null;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return hls;
    }
    video.src = source;
    return null;
  }

  ready(function () {
    var config = readConfig();
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");
    if (!config || !video || !button) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function play() {
      if (!attached) {
        hlsInstance = attach(video, config.source);
        attached = true;
      }
      button.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
