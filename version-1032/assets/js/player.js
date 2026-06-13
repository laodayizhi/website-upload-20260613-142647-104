(() => {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((root) => {
    const video = root.querySelector("video");
    const layer = root.querySelector(".play-layer");
    const src = root.dataset.video;
    let hls = null;
    let loaded = false;

    const setSource = () => {
      if (!video || !src || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      loaded = true;
    };

    const start = () => {
      setSource();

      if (layer) {
        layer.classList.add("is-hidden");
      }

      video.controls = true;
      const request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(() => {});
      }
    };

    if (layer) {
      layer.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", () => {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
