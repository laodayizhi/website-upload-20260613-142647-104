(function () {
    var loaderPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function loadLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (loaderPromise) {
            return loaderPromise;
        }
        loaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("播放器加载失败"));
                }
            };
            script.onerror = function () {
                reject(new Error("播放器加载失败"));
            };
            document.head.appendChild(script);
        });
        return loaderPromise;
    }

    function showMessage(player, text) {
        var message = player.querySelector(".player-message");
        if (message) {
            message.textContent = text;
        }
    }

    function playVideo(player) {
        if (player.classList.contains("is-ready")) {
            var existingVideo = player.querySelector("video");
            if (existingVideo) {
                existingVideo.play().catch(function () {});
            }
            return;
        }

        var source = player.getAttribute("data-video-source");
        var video = player.querySelector("video");
        if (!source || !video) {
            showMessage(player, "播放暂不可用");
            return;
        }

        player.classList.add("is-playing");
        player.classList.add("is-ready");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        loadLibrary().then(function (Hls) {
            if (!Hls.isSupported()) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage(player, "播放暂不可用");
                    hls.destroy();
                }
            });
        }).catch(function () {
            showMessage(player, "播放暂不可用");
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(function (player) {
            var overlay = player.querySelector(".player-overlay");
            var video = player.querySelector("video");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    playVideo(player);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    playVideo(player);
                });
            }
        });
    });
}());
