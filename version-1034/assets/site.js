(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
        bars.forEach(function (bar) {
            var container = bar.parentElement;
            var input = bar.querySelector('[data-card-search]');
            var yearSelect = bar.querySelector('[data-year-filter]');
            var reset = bar.querySelector('[data-reset-filter]');
            var count = bar.querySelector('[data-filter-count]');
            var grid = container ? container.querySelector('[data-filter-grid]') : null;
            if (!grid) {
                return;
            }
            var items = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

            function apply() {
                var query = normalize(input ? input.value : '');
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute('data-title'),
                        item.getAttribute('data-region'),
                        item.getAttribute('data-genre'),
                        item.getAttribute('data-category'),
                        item.getAttribute('data-tags'),
                        item.getAttribute('data-year')
                    ].join(' '));
                    var yearMatch = !year || item.getAttribute('data-year') === year;
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var shouldShow = yearMatch && queryMatch;
                    item.classList.toggle('hidden-card', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + ' 部';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
