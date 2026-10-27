/* Unique Fitness motion.
 * Inspired by the public reference's SVG draw, image expansion, split-line,
 * highlight-text and parallax patterns. No Webflow/Slater production dependency.
 * The content is visible by default; reduced motion and Pause revert all effects.
 */
(function () {
  "use strict";

  function prepareHeadings() {
    document.querySelectorAll("[data-split-lines]").forEach(function (heading) {
      if (heading.dataset.linesReady) return;
      var nodes = Array.from(heading.childNodes);
      heading.setAttribute("aria-label", nodes.map(function (node) {
        return node.nodeName === "BR" ? " " : node.textContent;
      }).join("").replace(/\s+/g, " ").trim());
      var line;
      function nextLine() {
        var mask = document.createElement("span");
        mask.className = "heading-line";
        mask.setAttribute("aria-hidden", "true");
        line = document.createElement("span");
        line.className = "heading-line-inner";
        mask.appendChild(line);
        heading.appendChild(mask);
      }
      heading.replaceChildren();
      nextLine();
      nodes.forEach(function (node) {
        if (node.nodeName === "BR") nextLine();
        else line.appendChild(node);
      });
      heading.dataset.linesReady = "true";
    });
  }

  function initCertificatePreview() {
    var list = document.querySelector(".certificate-grid");
    var toggle = document.querySelector("[data-certificates-toggle]");
    var label = document.querySelector("[data-certificates-label]");
    var status = document.querySelector("[data-certificates-status]");
    if (!list || !toggle || !label || !status) return;
    var cards = Array.from(list.querySelectorAll(".certificate-card"));
    var total = list.querySelectorAll(".certificate-image").length;
    var expanded = false;
    if (cards.length <= 3) return;

    function render() {
      cards.forEach(function (card, index) {
        card.hidden = !expanded && index >= 3;
      });
      toggle.setAttribute("aria-expanded", String(expanded));
      label.textContent = expanded ? "Show fewer certificates" : "View all " + total + " certificates";
      toggle.lastElementChild.textContent = expanded ? "↑" : "↓";
      status.textContent = expanded
        ? "Showing all " + total + " certificates"
        : "Showing 3 of " + total + " certificates";
    }

    render();
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      expanded = !expanded;
      render();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (!expanded) {
        var rect = toggle.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          toggle.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    });
  }

  function initMotion() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      document.body.dataset.motionStatus = "unavailable";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    var toggle = document.querySelector("[data-motion-toggle]");
    var label = toggle.querySelector("[data-motion-label]");
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var userPaused = false;
    var media;
    var playedIntro = false;

    function build() {
      if (media) media.revert();
      media = gsap.matchMedia();
      media.add({
        all: "(min-width: 0px)",
        desktop: "(min-width: 900px)",
        fine: "(hover: hover) and (pointer: fine)",
        reduced: "(prefers-reduced-motion: reduce)",
      }, function (context) {
        var conditions = context.conditions;
        var disabled = userPaused || conditions.reduced;
        document.body.dataset.motionStatus = disabled ? "paused" : "running";
        toggle.hidden = false;
        toggle.setAttribute("aria-pressed", String(disabled));
        label.textContent = disabled ? "Motion paused" : "Pause motion";
        toggle.setAttribute("aria-label", conditions.reduced
          ? "Reduced motion is enabled in your device settings"
          : disabled ? "Play animations" : "Pause animations");
        // The system preference wins. The control remains explanatory, not deceptive.
        toggle.disabled = conditions.reduced;
        if (disabled) return;

        var cleanups = [];
        var loops = [];
        function listen(element, event, callback, options) {
          element.addEventListener(event, callback, options);
          cleanups.push(function () { element.removeEventListener(event, callback, options); });
        }
        function drawPaths(selector, timeline, at, duration) {
          document.querySelectorAll(selector).forEach(function (path, index) {
            var length = path.getTotalLength();
            timeline.fromTo(path, { strokeDasharray: length, strokeDashoffset: length },
              { strokeDashoffset: 0, duration: duration, ease: "power2.inOut" }, at + index * .13);
          });
        }
        function visibleLoop(animation, element) {
          var entry = { animation: animation, visible: false };
          loops.push(entry);
          ScrollTrigger.create({
            trigger: element, start: "top bottom", end: "bottom top",
            onToggle: function (self) {
              entry.visible = self.isActive;
              animation.paused(!entry.visible || document.hidden);
            },
          });
        }
        listen(document, "visibilitychange", function () {
          loops.forEach(function (entry) {
            entry.animation.paused(document.hidden || !entry.visible);
          });
        });

        var hero = document.querySelector(".grind-hero");
        // Never replay the opening cover over someone already reading further down.
        if (!playedIntro && window.scrollY < 100 && !window.location.hash) {
          playedIntro = true;
          var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro.set(".hero-intro-brand", { display: "block" }, 0)
            .from(".hero-intro-brand__line > span", {
              yPercent: 115, duration: .65, stagger: .1,
            }, .05)
            .from(".hero-intro-brand__rule", { scaleX: 0, duration: .45 }, .42)
            .to(".hero-intro-brand", { yPercent: -100, duration: .6, ease: "power3.inOut" }, 1)
            .set(".hero-intro-brand", { display: "none" }, 1.6)
            .fromTo(".grind-hero__image", { scale: 1.08 }, { scale: 1, duration: 1.2 }, .75)
            .from(".site-header > *", { y: -22, opacity: 0, stagger: .1, duration: .7 }, .85)
            .from("#hero-title .heading-line-inner", { yPercent: 115, rotate: 2, duration: .8, stagger: .1 }, 1.05)
            .from(".grind-hero__copy > p, .grind-hero__copy > .pill", { y: 25, opacity: 0, stagger: .1, duration: .7 }, 1.2)
            .from(".start-card", { y: 45, opacity: 0, duration: .8 }, 1.3)
            .from(".grind-hero__bottom", { opacity: 0, y: 12, duration: .6 }, 1.45);
          drawPaths(".seal-u", intro, 1.05, .9);
          drawPaths(".hero-scribble path", intro, 1.3, .7);
        }
        gsap.set(".seal-ring", { svgOrigin: "100 100" });
        visibleLoop(gsap.to(".seal-ring", { rotation: 360, duration: 38, repeat: -1, ease: "none", paused: true }), hero);
        gsap.to(".hero-ghost-word", {
          xPercent: -12, y: -30, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
        });
        if (conditions.desktop) {
          gsap.to(".grind-hero__image", {
            yPercent: 14, ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
          });
        }

        var ribbon = document.querySelector(".motion-ribbon");
        visibleLoop(gsap.to(".motion-ribbon__track", {
          xPercent: -50, duration: 24, ease: "none", repeat: -1, paused: true,
        }), ribbon);

        document.querySelectorAll("[data-split-lines]:not(#hero-title)").forEach(function (heading) {
          gsap.from(heading.querySelectorAll(".heading-line-inner"), {
            yPercent: 110, rotate: 1.8, duration: .95, ease: "power3.out", stagger: .09,
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
          });
        });
        document.querySelectorAll(".section-heading__copy, .gym-facts > *, .training-note, .review, .questions__intro > p").forEach(function (element) {
          gsap.from(element, {
            y: 28, opacity: 0, duration: .8, ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          });
        });
        document.querySelectorAll(".training-card, .founder-story-card, .certificate-card").forEach(function (element, index) {
          gsap.from(element, {
            y: 55, opacity: 0, clipPath: "inset(14% 0% 0% round 12px)", duration: .95,
            delay: index % 3 * .07, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          });
        });

        var collage = document.querySelector(".floor-collage");
        var gridTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: collage, start: "center center",
            end: function () {
              return "+=" + (conditions.desktop ? 650 : Math.max(420, window.innerHeight * .85));
            },
            pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        gridTimeline.from(".collage-tile--founder img", {
          scale: conditions.desktop ? 1.6 : 1.85,
          duration: 1, ease: "power2.inOut", transformOrigin: "center bottom",
        }, 0)
          .from(".collage-tile:not(.collage-tile--main)", {
            scale: .35, opacity: 0,
            x: function (i) {
              var distance = conditions.desktop ? 90 : 60;
              return i % 2 === 0 ? -distance : distance;
            },
            y: 0,
            duration: 1.1, stagger: .08, ease: "power2.out",
          }, .15)
          .from(".collage-caption", { y: 22, opacity: 0, duration: .3 }, .85);
        gsap.fromTo(".visit > img", { yPercent: -8, scale: 1.16 }, {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: ".visit", start: "top bottom", end: "bottom top", scrub: true },
        });

        if (conditions.fine) {
          document.querySelectorAll(".pill").forEach(function (button) {
            var xTo = gsap.quickTo(button, "x", { duration: .5, ease: "power3.out" });
            var yTo = gsap.quickTo(button, "y", { duration: .5, ease: "power3.out" });
            listen(button, "pointermove", function (event) {
              if (event.pointerType === "touch") return;
              var rect = button.getBoundingClientRect();
              xTo((event.clientX - rect.left - rect.width / 2) * .12);
              yTo((event.clientY - rect.top - rect.height / 2) * .16);
            });
            listen(button, "pointerleave", function () { xTo(0); yTo(0); });
            listen(button, "blur", function () { xTo(0); yTo(0); });
          });
        }
        // Images have intrinsic dimensions and fixed frames. Refreshing on each
        // lazy image load interrupts native smooth-scroll anchor navigation.
        ScrollTrigger.refresh();
        return function () { cleanups.forEach(function (cleanup) { cleanup(); }); };
      });
    }
    toggle.addEventListener("click", function () {
      userPaused = !userPaused;
      build();
    });
    // matchMedia rebuilds animation contexts on a live system preference change.
    prefersReduced.addEventListener("change", function () {
      if (!prefersReduced.matches) userPaused = false;
    });
    build();
    if (document.fonts) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  function init() {
    prepareHeadings();
    initCertificatePreview();
    initMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
