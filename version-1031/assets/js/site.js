const hlsModulePromise = import('./hls-vendor-dru42stk.js')
  .then((module) => module.H)
  .catch(() => null);

function initMobileNav() {
  const button = document.querySelector('[data-mobile-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');

  if (slides.length <= 1) {
    return;
  }

  let current = 0;
  let timer;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  prev?.addEventListener('click', () => {
    show(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  start();
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function initFilters() {
  const scope = document.querySelector('[data-filter-scope]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const search = document.querySelector('[data-movie-search]');
  const type = document.querySelector('[data-filter-type]');
  const region = document.querySelector('[data-filter-region]');
  const year = document.querySelector('[data-filter-year]');
  const result = document.querySelector('[data-filter-result]');

  if (!scope || cards.length === 0) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search');
  if (initialSearch && search) {
    search.value = initialSearch;
    const library = document.getElementById('all-movies') || scope;
    window.requestAnimationFrame(() => library.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  const apply = () => {
    const query = normalize(search?.value);
    const selectedType = normalize(type?.value);
    const selectedRegion = normalize(region?.value);
    const selectedYear = normalize(year?.value);
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags,
        card.textContent,
      ].join(' '));
      const matchSearch = !query || haystack.includes(query);
      const matchType = !selectedType || normalize(card.dataset.type) === selectedType;
      const matchRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
      const matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
      const shouldShow = matchSearch && matchType && matchRegion && matchYear;

      card.classList.toggle('is-filter-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (result) {
      result.textContent = `显示 ${visible} / ${cards.length}`;
    }
  };

  [search, type, region, year].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });

  apply();
}

function initImageFallback() {
  document.querySelectorAll('.cover-wrap img').forEach((image) => {
    image.addEventListener('error', () => {
      const wrap = image.closest('.cover-wrap');
      if (wrap) {
        wrap.classList.add('no-image');
      }
      image.remove();
    }, { once: true });
  });
}

function setPlayerStatus(shell, message, isError = false) {
  const status = shell.querySelector('[data-player-status]');
  if (!status) {
    return;
  }
  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

async function loadPlayer(video) {
  const shell = video.closest('[data-player-shell]');
  const overlay = shell?.querySelector('[data-player-trigger]');
  const source = video.dataset.src;

  if (!shell || !source) {
    if (shell) {
      setPlayerStatus(shell, '当前影片没有可用播放源。', true);
    }
    return;
  }

  if (video.dataset.loaded === '1') {
    overlay?.classList.add('is-hidden');
    try {
      await video.play();
    } catch (error) {
      setPlayerStatus(shell, '浏览器阻止自动播放，请再次点击视频播放。', false);
    }
    return;
  }

  setPlayerStatus(shell, '正在加载 HLS 播放源…');
  const Hls = await hlsModulePromise;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
      video.dataset.loaded = '1';
      overlay?.classList.add('is-hidden');
      setPlayerStatus(shell, '播放源已就绪。');
      try {
        await video.play();
      } catch (error) {
        setPlayerStatus(shell, '播放源已就绪，请再次点击播放。');
      }
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data?.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setPlayerStatus(shell, '网络加载异常，正在重试…', true);
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setPlayerStatus(shell, '媒体解码异常，正在恢复…', true);
        hls.recoverMediaError();
      } else {
        setPlayerStatus(shell, '视频播放源加载失败。', true);
        hls.destroy();
      }
    });

    video._hls = hls;
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.loaded = '1';
    overlay?.classList.add('is-hidden');
    setPlayerStatus(shell, '播放源已就绪。');
    try {
      await video.play();
    } catch (error) {
      setPlayerStatus(shell, '播放源已就绪，请再次点击播放。');
    }
    return;
  }

  video.src = source;
  video.dataset.loaded = '1';
  overlay?.classList.add('is-hidden');
  setPlayerStatus(shell, '已尝试直接加载播放源。');
  try {
    await video.play();
  } catch (error) {
    setPlayerStatus(shell, '浏览器不支持当前 HLS 播放方式。', true);
  }
}

function initPlayers() {
  document.querySelectorAll('[data-player-shell]').forEach((shell) => {
    const video = shell.querySelector('[data-hls-player]');
    const trigger = shell.querySelector('[data-player-trigger]');

    if (!video) {
      return;
    }

    const start = () => loadPlayer(video);
    trigger?.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.dataset.loaded === '1') {
        return;
      }
      start();
    });
    video.addEventListener('play', () => trigger?.classList.add('is-hidden'));
  });
}

initMobileNav();
initHero();
initFilters();
initImageFallback();
initPlayers();
