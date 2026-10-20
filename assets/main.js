(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var content = window.UNIQUE_FITNESS_CONTENT || {};

  function setText(selector, value) {
    if (typeof value !== "string") {
      return;
    }

    document.querySelectorAll(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  function applyContentModel() {
    var contact = content.contact || {};
    var placeholders = content.placeholders || {};
    var now = new Date().getFullYear();

    setText("[data-current-year]", String(now));
    setText('[data-placeholder="phone"]', contact.phone || placeholders.phone);
    setText('[data-placeholder="email"]', contact.email || placeholders.email);
    setText('[data-placeholder="address"]', contact.address || placeholders.streetAddress);
    setText('[data-placeholder="hours"]', contact.hours || placeholders.hours);
    setText('[data-placeholder="form-endpoint"]', placeholders.formEndpoint);
  }

  function applyServices() {
    var services = content.services || [];

    services.forEach(function (service) {
      document.querySelectorAll('[data-service="' + service.id + '"]').forEach(function (card) {
        var image = card.querySelector("img");
        var title = card.querySelector("h3");
        var description = card.querySelector('.service-card__body > p:not(.service-card__number)');

        if (image) {
          image.src = service.image;
          image.alt = service.imageAlt;
        }

        if (title) {
          title.textContent = service.name;
        }

        if (description) {
          description.textContent = service.description;
        }
      });
    });
  }

  function applyBlogPosts() {
    var posts = (content.blog && content.blog.posts) || [];

    document.querySelectorAll(".blog-grid .blog-card").forEach(function (card, index) {
      var post = posts[index];

      if (!post) {
        return;
      }

      var image = card.querySelector("img");
      var title = card.querySelector("h3");
      var excerpt = card.querySelector('.blog-card__body > p:not(.blog-card__meta)');
      var meta = card.querySelector(".blog-card__meta");
      var links = card.querySelectorAll("a");

      if (image) {
        image.src = post.image;
        image.alt = post.imageAlt;
      }

      if (title) {
        title.textContent = post.title;
      }

      if (excerpt) {
        excerpt.textContent = post.excerpt;
      }

      if (meta) {
        meta.textContent = post.date + " · " + post.author;
      }

      links.forEach(function (link) {
        link.href = post.slug;
      });
    });
  }

  function closeMenu(toggle, panel) {
    if (!toggle || !panel) {
      return;
    }

    toggle.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("is-open", !expanded);
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(toggle, panel);
      });
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu(toggle, panel);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu(toggle, panel);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMenu(toggle, panel);
      }
    });
  }

  function initReveal() {
    var elements = document.querySelectorAll(".reveal");

    if (!elements.length || reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, instance) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    elements.forEach(function (element, index) {
      element.style.transitionDelay = (Math.min(index % 4, 3) * 70) + "ms";
      observer.observe(element);
    });
  }

  function initMotionTargets() {
    var selectors = [
      ".page-hero__content > *",
      ".page-hero__media",
      ".section-heading > *",
      ".service-card",
      ".facility-card",
      ".blog-card",
      ".membership-cta > *",
      ".contact-detail",
      ".contact-form > *",
      ".blog-post__body > *",
      ".blog-post__header",
      ".blog-post__hero",
      ".blog-post__footer",
      ".site-footer__column",
      ".site-footer__brand"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (element) {
      element.classList.add("reveal");
    });
  }

  function initHeroMotion() {
    var heroImage = document.querySelector(".page-hero__media img");

    if (!heroImage || reducedMotion) {
      return;
    }

    var ticking = false;

    function updatePosition() {
      var distance = Math.min(window.scrollY * 0.035, 24);
      heroImage.style.transform = "scale(1.04) translate3d(0, " + distance + "px, 0)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updatePosition);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function setFormStatus(form, message, isError) {
    var currentStatus = form.querySelector(".form-status");
    var status = currentStatus || document.createElement("p");

    status.className = "form-status";
    status.setAttribute("role", isError ? "alert" : "status");
    status.textContent = message;

    if (!currentStatus) {
      form.appendChild(status);
    }
  }

  function initForm() {
    var form = document.querySelector("#contact-form");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        setFormStatus(form, "Please complete the required fields before sending your enquiry.", true);
        form.querySelector(":invalid")?.focus();
        return;
      }

      var endpoint = form.getAttribute("data-form-endpoint") || form.getAttribute("action") || "";
      var isPlaceholder = !endpoint || endpoint === "#" || endpoint.indexOf("[") !== -1;

      if (isPlaceholder) {
        event.preventDefault();
        setFormStatus(
          form,
          "The enquiry form is ready. Add a real HTTPS form endpoint in contact/index.html before launch.",
          false
        );
      }
    });
  }

  function initPlaceholderLinks() {
    document.querySelectorAll('a[href^="#social-link-placeholder"], a[href^="#app-link-placeholder"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var label = link.textContent.trim().split("[")[0].trim();
        window.alert(label + " link will be added when the brand confirms it.");
      });
    });
  }

  function init() {
    applyContentModel();
    applyServices();
    applyBlogPosts();
    initMenu();
    initMotionTargets();
    initReveal();
    initHeroMotion();
    initForm();
    initPlaceholderLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
