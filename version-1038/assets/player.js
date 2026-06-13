import { H as Hls } from "./hlsjs-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector(".play-button");

        if (!video || !button) {
            return;
        }

        function attachAndPlay() {
            var source = video.getAttribute("data-video-url");

            if (!source) {
                return;
            }

            frame.classList.add("is-playing");
            video.setAttribute("controls", "controls");

            if (Hls.isSupported()) {
                if (!video.hlsController) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsController = hls;
                }
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.src !== source) {
                    video.src = source;
                }
            } else if (video.src !== source) {
                video.src = source;
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener("click", attachAndPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                attachAndPlay();
            }
        });
    });
});
