document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-slide") || 0);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var searchInput = document.getElementById("site-search-input");
    var searchList = document.getElementById("search-list");

    function filterSearch(value) {
        if (!searchList) {
            return;
        }

        var keyword = String(value || "").trim().toLowerCase();
        var items = Array.prototype.slice.call(searchList.querySelectorAll(".search-item"));

        items.forEach(function (item) {
            var text = String(item.getAttribute("data-search") || item.textContent || "").toLowerCase();
            item.hidden = keyword.length > 0 && text.indexOf(keyword) === -1;
        });
    }

    if (searchInput) {
        searchInput.value = query;
        filterSearch(query);
        searchInput.addEventListener("input", function () {
            filterSearch(searchInput.value);
        });
    }
});
