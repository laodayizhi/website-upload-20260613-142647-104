function createMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var playButton = document.getElementById(options.playButtonId);
    var hlsInstance = null;
    var initialized = false;

    if (!video || !options.source) {
        return;
    }

    function beginPlayback() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        if (!initialized) {
            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(options.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = options.source;
            }
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlayback);
    }

    if (playButton) {
        playButton.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                beginPlayback();
            }
        });
    }

    video.addEventListener("click", function () {
        if (!initialized || video.paused) {
            beginPlayback();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
