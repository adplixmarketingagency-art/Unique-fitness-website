(function () {
  "use strict";

  var content = window.UNIQUE_FITNESS_CONTENT || {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------- content application */

  function setText(selector, value) {
    if (typeof value !== "string" || !value) {
      return;
    }
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function setLinks(selector, attr, value) {
    if (!value) {
      return;
    }
    document.querySelectorAll(selector).forEach(function (el) {
      el.setAttribute(attr, value);
    });
  }

  function applyContent() {
    var contact = content.contact || {};
    var hours = content.hours || {};

    setText("[data-current-year]", String(new Date().getFullYear()));
    setText('[data-placeholder="phone"]', contact.phoneDisplay || "");
    setText('[data-placeholder="tel"]', contact.phoneDisplay || "");
    setText('[data-placeholder="address"]', contact.address || "");
    setText('[data-placeholder="address-short"]', contact.addressShort || "");
    setText('[data-placeholder="hours"]', contact.hoursText || (hours.open + "–" + hours.close));
    setLinks('[data-tel]', "href", contact.phoneTel ? "tel:" + contact.phoneTel : null);
  }

  /* ------------------------------------------------------- header state */

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    var ticking = false;
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };

    update();

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* --------------------------------------------------------- mobile menu */

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!toggle || !panel) {
      return;
    }

    function open() {
      toggle.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      panel.style.display = "flex";
      var first = panel.querySelector("a");
      if (first) {
        window.setTimeout(function () { first.focus(); }, 60);
      }
    }

    function close(instant) {
      toggle.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      if (instant) {
        panel.style.display = "";
      } else {
        window.setTimeout(function () {
          if (!panel.classList.contains("is-open")) {
            panel.style.display = "";
          }
        }, 280);
      }
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") {
        close(true);
      } else {
        open();
      }
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        close(true);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") {
        return;
      }
      close(true);
      toggle.focus();
    });

    document.addEventListener("click", function (event) {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !panel.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        close(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        close(true);
      }
    });
  }

  /* ------------------------------------------------ open-now (live thing) */

  function initOpenNow() {
    var host = document.querySelector("[data-open-now]");
    if (!host) {
      return;
    }

    var hours = content.hours || {};
    var openAt = hours.open || "05:00";
    var closeAt = hours.close || "22:00";

    function minutes(value) {
      var parts = value.split(":");
      return Number(parts[0]) * 60 + Number(parts[1] || 0);
    }

    function render() {
      var now = new Date();
      var t = now.getHours() * 60 + now.getMinutes();
      var isOpen = t >= minutes(openAt) && t < minutes(closeAt);
      var text;

      if (isOpen) {
        text = "Open now · closes " + closeAt;
      } else if (t < minutes(openAt)) {
        text = "Opens " + openAt + " today";
      } else {
        text = "Opens " + openAt + " tomorrow";
      }

      host.textContent = text;
      host.classList.toggle("is-closed", !isOpen);
    }

    render();
    window.setInterval(render, 60000);
  }

  /* -------------------------------------------------- reveal on scroll */

  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) {
      return;
    }

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, instance) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-in");
          instance.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------- line-split for headings without authored lines */

  function initLineSplit() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-lines]"));

    if (!els.length || !("IntersectionObserver" in window) || reducedMotion) {
      return;
    }

    var restore = function (el) {
      el.textContent = el.dataset.text;
    };

    var split = function (el) {
      var text = el.textContent.trim().replace(/\s+/g, " ");
      el.dataset.text = text;
      el.textContent = "";
      var words = text.split(" ").map(function (word) {
        var s = document.createElement("span");
        s.style.display = "inline-block";
        s.textContent = word;
        el.append(s, " ");
        return s;
      });

      var lines = [];
      words.forEach(function (w) {
        var last = lines[lines.length - 1];
        if (last && Math.abs(last.top - w.offsetTop) < 4) {
          last.words.push(w.textContent);
        } else {
          lines.push({ top: w.offsetTop, words: [w.textContent] });
        }
      });

      el.textContent = "";
      lines.forEach(function (line, i) {
        var mask = document.createElement("span");
        mask.className = "line";
        var inner = document.createElement("span");
        inner.style.setProperty("--i", String(i));
        inner.textContent = line.words.join(" ");
        mask.append(inner);
        el.append(mask, " ");
      });
    };

    var io = new IntersectionObserver(
      function (entries, instance) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          instance.unobserve(entry.target);
          entry.target.classList.add("is-in");
          var lastSpan = entry.target.querySelector(".line:last-of-type > span");
          if (lastSpan) {
            lastSpan.addEventListener("transitionend", function () {
              restore(entry.target);
            }, { once: true });
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    document.fonts.ready.then(function () {
      els.forEach(function (el) {
        split(el);
        io.observe(el);
      });
    });

    var width = window.innerWidth;
    window.addEventListener("resize", function () {
      if (window.innerWidth === width) {
        return;
      }
      width = window.innerWidth;
      els.filter(function (el) { return !el.classList.contains("is-in"); }).forEach(function (el) {
        io.unobserve(el);
        restore(el);
      });
    });
  }

  /* --------------------------------- split-stage crossfade by section position

     Sections declare which stage image they represent via data-stage="N".
     A band across the middle of the viewport activates that image. Without
     reduced motion and without JS gating, the first image shows.  */

  function initStage() {
    var stage = document.querySelector(".stage__media");
    if (!stage) {
      return;
    }

    stage.classList.add("is-ready");

    var images = Array.prototype.slice.call(stage.querySelectorAll("img"));
    if (!images.length) {
      return;
    }

    if (reducedMotion || !("IntersectionObserver" in window) || window.innerWidth <= 1024) {
      images.forEach(function (img, i) {
        img.classList.toggle("is-on", i === 0);
      });
      return;
    }

    var show = function (index) {
      images.forEach(function (img, i) {
        img.classList.toggle("is-on", i === index);
      });
    };

    var sections = document.querySelectorAll("[data-stage]");
    if (!sections.length) {
      var i = 0;
      var timer = 0;
      var runTimed = function () {
        show(i % images.length);
        i += 1;
      };
      var tick = function () {
        timer = window.setInterval(runTimed, 5200);
      };
      runTimed();
      tick();

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          window.clearInterval(timer);
        } else {
          tick();
        }
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          show(Number(entry.target.getAttribute("data-stage")) || 0);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      io.observe(section);
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        var on = images.findIndex(function (img) { return img.classList.contains("is-on"); });
        show(on < 0 ? 0 : on);
      }
    });
  }

  /* ----------------------------------------------- magnetic BMI CTA */

  function initMagnetic() {
    var magnets = document.querySelectorAll("[data-magnetic]");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!magnets.length || reducedMotion || !finePointer.matches) {
      return;
    }

    magnets.forEach(function (element) {
      var frame = 0;
      var active = false;
      var targetX = 0;
      var targetY = 0;
      var currentX = 0;
      var currentY = 0;

      function schedule() {
        if (!frame) {
          frame = window.requestAnimationFrame(render);
        }
      }

      function render() {
        frame = 0;
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
        element.style.setProperty("--magnet-x", currentX.toFixed(2) + "px");
        element.style.setProperty("--magnet-y", currentY.toFixed(2) + "px");

        if (active || Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
          schedule();
        } else {
          currentX = 0;
          currentY = 0;
          element.style.setProperty("--magnet-x", "0px");
          element.style.setProperty("--magnet-y", "0px");
        }
      }

      function pointTo(event) {
        var rect = element.getBoundingClientRect();
        var offsetX = event.clientX - (rect.left + rect.width / 2);
        var offsetY = event.clientY - (rect.top + rect.height / 2);
        var distance = Math.hypot(offsetX, offsetY);
        var radius = Math.max(rect.width, rect.height) * 1.35;
        var influence = Math.max(0, 1 - distance / radius);

        targetX = offsetX * 0.2 * influence;
        targetY = offsetY * 0.2 * influence;
        schedule();
      }

      element.addEventListener("pointerenter", function (event) {
        active = true;
        pointTo(event);
      });

      element.addEventListener("pointermove", pointTo);

      element.addEventListener("pointerleave", function () {
        active = false;
        targetX = 0;
        targetY = 0;
        schedule();
      });
    });
  }

  /* ------------------------------------------- hero scroll choreography */

  function initScrollScene() {
    var hero = document.querySelector("[data-scroll-scene]");
    if (!hero) {
      return;
    }

    var ticking = false;
    var update = function () {
      var rect = hero.getBoundingClientRect();
      var travel = Math.max(1, hero.offsetHeight - window.innerHeight * 0.35);
      var progress = Math.max(0, Math.min(1, -rect.top / travel));
      hero.style.setProperty("--hero-scroll", progress.toFixed(3));
      if (window.UNIQUE_FITNESS_SPACE && typeof window.UNIQUE_FITNESS_SPACE.setScroll === "function") {
        window.UNIQUE_FITNESS_SPACE.setScroll(progress);
      }
      ticking = false;
    };

    var schedule = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();

    if (reducedMotion) {
      return;
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }

  /* ----------------------------------------------- hero BMI mini-check */

  function initHeroBMI() {
    var form = document.querySelector("[data-hero-bmi]");
    if (!form) {
      return;
    }

    var result = form.querySelector("[data-hero-bmi-result]");
    var value = form.querySelector("[data-hero-bmi-value]");
    var bandOutput = form.querySelector("[data-hero-bmi-band]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var height = Number(form.elements.height.value);
      var weight = Number(form.elements.weight.value);

      if (!isFinite(height) || height < 100 || height > 250 || !isFinite(weight) || weight < 25 || weight > 300) {
        value.textContent = "!";
        bandOutput.textContent = "Use 100–250 cm and 25–300 kg.";
        result.classList.remove("is-ready");
        return;
      }

      var bmi = weight / Math.pow(height / 100, 2);
      var band = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obese";
      value.textContent = bmi.toFixed(1);
      bandOutput.textContent = "BMI · " + band;
      result.classList.add("is-ready");
    });
  }

  /* ------------------------------------------------------------- forms */

  function setFormStatus(form, message, isError) {
    var existing = form.querySelector(".form-status");
    var status = existing || document.createElement("p");
    status.className = "form-status" + (isError ? " is-error" : "");
    status.setAttribute("role", isError ? "alert" : "status");
    status.textContent = message;
    if (!existing) {
      form.appendChild(status);
    }
  }

  function initForm() {
    var form = document.querySelector("#contact-form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      form.classList.add("was-submitted");

      if (!form.checkValidity()) {
        event.preventDefault();
        setFormStatus(form, "Please complete the required fields before sending your enquiry.", true);
        var invalid = form.querySelector(":invalid");
        if (invalid) {
          invalid.focus();
        }
        return;
      }

      var endpoint = form.getAttribute("data-form-endpoint") || form.getAttribute("action") || "";
      var isPlaceholder = !endpoint || endpoint === "#" || endpoint.indexOf("[") !== -1;

      if (isPlaceholder) {
        event.preventDefault();
        setFormStatus(
          form,
          "Nothing was sent: this form isn’t connected to an inbox yet. Call " +
            ((content.contact && content.contact.phoneDisplay) || "the gym") +
            " and the desk can help straight away.",
          true
        );
      }
    });

    form.querySelectorAll("input, textarea, select").forEach(function (field) {
      field.addEventListener("blur", function () {
        field.classList.add("touched");
      });
    });
  }

  /* ------------------------------------------------------------- init */

  function init() {
    applyContent();
    initHeader();
    initMenu();
    initOpenNow();
    initReveals();
    initLineSplit();
    initStage();
    initScrollScene();
    initMagnetic();
    initHeroBMI();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
