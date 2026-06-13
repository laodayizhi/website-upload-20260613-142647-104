import { H as Hls } from './hlsjs.js';

function setupPlayer(panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('[data-play-button]');
    var source = panel.getAttribute('data-video-source') || (video ? video.getAttribute('data-video-src') : '');
    var started = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function markPlaying() {
        panel.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
    }

    function recoverHls(errorData) {
        if (!hls || !errorData || !errorData.fatal) {
            return;
        }
        if (errorData.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
        }
        if (errorData.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
        }
        hls.destroy();
    }

    function start() {
        markPlaying();
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                lowLatencyMode: true,
                enableWorker: true,
                backBufferLength: 60
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
                recoverHls(data);
            });
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            start();
        });
    }

    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
