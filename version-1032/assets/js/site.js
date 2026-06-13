(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5200);
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        play();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  }

  const roots = Array.from(document.querySelectorAll("[data-filter-root]"));

  roots.forEach((root) => {
    const input = root.querySelector("[data-search-input]");
    const buttons = Array.from(root.querySelectorAll("[data-filter-value]"));
    const cards = Array.from(root.querySelectorAll("[data-card]"));
    let activeValue = "";

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach((card) => {
        const haystack = (card.dataset.search || "").toLowerCase();
        const typeText = (card.dataset.type || "").toLowerCase();
        const matchedQuery = !query || haystack.includes(query);
        const matchedType = !activeValue || haystack.includes(activeValue) || typeText.includes(activeValue);
        card.classList.toggle("is-hidden", !(matchedQuery && matchedType));
      });
    };

    if (input) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");

      if (q) {
        input.value = q;
      }

      input.addEventListener("input", apply);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        activeValue = (button.dataset.filterValue || "").toLowerCase();
        apply();
      });
    });

    apply();
  });
})();
