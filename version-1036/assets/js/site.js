(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    start();
  }

  function initYearSection() {
    var root = document.querySelector("[data-year-section]");
    if (!root) {
      return;
    }
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-year-button]"));
    var cards = Array.prototype.slice.call(root.querySelectorAll(".filter-card"));
    if (!buttons.length || !cards.length) {
      return;
    }
    function showYear(year) {
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-year-button") === year);
      });
      cards.forEach(function (card) {
        card.classList.toggle("year-card-hidden", card.getAttribute("data-year") !== year);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        showYear(button.getAttribute("data-year-button"));
      });
    });
    showYear(buttons[0].getAttribute("data-year-button"));
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    var list = document.querySelector("[data-filter-list]");
    if (!root || !list) {
      return;
    }
    var input = root.querySelector("[data-filter-input]");
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
    var empty = root.querySelector("[data-empty-state]");
    var activeField = "all";
    var activeValue = "all";

    function textOf(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" "));
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var matchesText = !query || textOf(card).indexOf(query) !== -1;
        var matchesButton = true;
        if (activeValue !== "all") {
          matchesButton = normalize(card.getAttribute("data-" + activeField)).indexOf(normalize(activeValue)) !== -1;
        }
        var show = matchesText && matchesButton;
        card.classList.toggle("is-filtered", !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        activeField = button.getAttribute("data-filter-field") || "all";
        apply();
      });
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initYearSection();
    initFilters();
  });
})();
