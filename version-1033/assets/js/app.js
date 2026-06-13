(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchAndFilters() {
        var scope = document.querySelector(".search-scope");
        var input = document.querySelector(".search-input");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        if (!scope || (!input && !chips.length)) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
        var activeFilter = "all";

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var query = input ? normalize(input.value) : "";
            cards.forEach(function (card) {
                var pack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type")
                ].join(" "));
                var passesQuery = !query || pack.indexOf(query) !== -1;
                var passesFilter = activeFilter === "all" || pack.indexOf(normalize(activeFilter)) !== -1;
                card.hidden = !(passesQuery && passesFilter);
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupSearchAndFilters();
    });
}());
