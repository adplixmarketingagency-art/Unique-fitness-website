/* Original founder archive + Grind-inspired scroll stacking and SVG drawing.
   No slideshow hides the archive: all content works without JS or GSAP. */
(function () {
  "use strict";

  function initCertificatePreview() {
    var list = document.querySelector("#founder-documents");
    var toggle = document.querySelector("[data-certificates-toggle]");
    var status = document.querySelector("[data-certificates-status]");
    if (!list || !toggle || !status) return;
    var cards = Array.from(list.querySelectorAll(".founder-document"));
    var total = list.querySelectorAll("img").length;
    var expanded = false;
    if (cards.length <= 3) return;

    function render() {
      cards.forEach(function (card, index) { card.hidden = !expanded && index >= 3; });
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Show fewer certificates" : "View all " + total + " certificates";
      status.textContent = expanded ? "Showing all " + total + " certificates" : "Showing 3 of " + total + " certificates";
    }
    // Progressive enhancement: the complete archive stays readable without JS.
    render();
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      expanded = !expanded;
      render();
      document.dispatchEvent(new CustomEvent("unique:certificates-change"));
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (!expanded) {
        var rect = toggle.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          toggle.scrollIntoView({ block: "center", behavior: "instant" });
        }
      }
    });
  }

  function initViewer() {
    var dialog = document.querySelector("[data-founder-viewer]");
    if (!dialog || typeof dialog.showModal !== "function") return;
    var links = Array.from(document.querySelectorAll("[data-founder-photo]"));
    var image = dialog.querySelector("[data-founder-viewer-image]");
    var placeholder = image.src;
    var title = dialog.querySelector("#founder-viewer-title");
    var count = dialog.querySelector("[data-founder-count]");
    var index = 0;
    var returnFocus;

    function show(next) {
      index = (next + links.length) % links.length;
      var link = links[index];
      var original = link.querySelector("img");
      image.src = link.href;
      image.alt = original.alt;
      image.width = original.width;
      image.height = original.height;
      title.textContent = link.dataset.photoTitle;
      count.textContent = (index + 1) + " / " + links.length;
    }
    links.forEach(function (link, position) {
      link.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        returnFocus = link;
        show(position);
        document.body.classList.add("founder-viewing");
        dialog.showModal();
      });
    });
    dialog.querySelector("[data-founder-close]").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector("[data-founder-previous]").addEventListener("click", function () { show(index - 1); });
    dialog.querySelector("[data-founder-next]").addEventListener("click", function () { show(index + 1); });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
    });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("founder-viewing");
      image.src = placeholder;
      if (returnFocus) returnFocus.focus({ preventScroll: true });
    });
  }

  function initFounderMotion() {
    var section = document.querySelector(".founder-experience");
    var toggle = document.querySelector("[data-founder-toggle]");
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!section || !toggle || !gsap || !ScrollTrigger) {
      document.body.dataset.founderMotion = "unavailable";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    var localPaused = false;
    var globalPaused = document.body.dataset.motionStatus === "paused";
    var media = gsap.matchMedia();

    function build() {
      media.revert();
      media.add({
        desktop: "(min-width: 1000px) and (min-height: 650px)",
        reduced: "(prefers-reduced-motion: reduce)",
        all: "(min-width: 0px)",
      }, function (context) {
        var reduced = context.conditions.reduced;
        var paused = localPaused || globalPaused || reduced;
        document.body.dataset.founderMotion = paused ? "paused" : "running";
        toggle.hidden = false;
        toggle.disabled = reduced || globalPaused;
        toggle.setAttribute("aria-pressed", String(paused));
        toggle.textContent = reduced ? "Reduced motion enabled"
          : globalPaused ? "Founder motion paused" : paused ? "Play founder motion" : "Pause founder motion";
        if (paused) return;

        document.querySelectorAll("[data-founder-heading], .founder-intro__copy > h3, .founder-story-heading > div").forEach(function (element) {
          gsap.from(element, {
            y: 35, opacity: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          });
        });
        gsap.from(".founder-intro__portrait", {
          y: 55, opacity: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: ".founder-intro", start: "top 90%", once: true },
        });
        var sketch = document.querySelector(".founder-sketch path");
        if (sketch) {
          var length = sketch.getTotalLength();
          gsap.fromTo(sketch, { strokeDasharray: length, strokeDashoffset: length }, {
            strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut",
            scrollTrigger: { trigger: sketch, start: "top 90%", once: true },
          });
        }
        var items = Array.from(document.querySelectorAll(".founder-stack__item"));
        var previousTops = items.map(function (item) { return item.style.getPropertyValue("--stack-top"); });
        var previousPositions = items.map(function (item) { return item.style.getPropertyValue("position"); });
        function measureStack() {
          // If a card is taller than the phone, let its entire content scroll
          // into view before pinning its bottom. No clipped copy or inner scroll.
          items.forEach(function (item, index) {
            var top = context.conditions.desktop ? 90 : 24 + index * 5;
            item.style.setProperty("--stack-top", Math.min(top, window.innerHeight - item.offsetHeight - 32) + "px");
          });
        }
        function prepareStackRefresh() {
          // Measure natural positions, not the positions of already-stuck cards
          // when reloading a deep link or rotating the phone midway through.
          items.forEach(function (item) { item.style.setProperty("position", "relative"); });
          measureStack();
        }
        function finishStackRefresh() {
          items.forEach(function (item, index) {
            if (previousPositions[index]) item.style.setProperty("position", previousPositions[index]);
            else item.style.removeProperty("position");
          });
        }
        measureStack();
        ScrollTrigger.addEventListener("refreshInit", prepareStackRefresh);
        ScrollTrigger.addEventListener("refresh", finishStackRefresh);
        items.forEach(function (item, index) {
          var next = items[index + 1];
          if (!next) return;
          gsap.to(item.querySelector(".founder-story-card"), {
            scale: context.conditions.desktop ? .94 : .96,
            rotation: (index % 2 ? 1 : -1) * (context.conditions.desktop ? 1 : .6),
            ease: "none",
            scrollTrigger: {
              trigger: next, start: "top 92%",
              end: function () { return "top " + next.style.getPropertyValue("--stack-top"); },
              scrub: .7, invalidateOnRefresh: true,
            },
          });
        });
        var documentsMotion;
        function animateDocuments() {
          if (documentsMotion) documentsMotion.revert();
          documentsMotion = gsap.context(function () {
            document.querySelectorAll(".founder-document:not([hidden])").forEach(function (documentCard, index) {
              gsap.from(documentCard, {
                y: 35, opacity: 0, rotation: index % 2 ? .7 : -.7,
                duration: .85, ease: "power3.out",
                scrollTrigger: { trigger: documentCard, start: "top 94%", once: true },
              });
            });
          });
        }
        animateDocuments();
        document.addEventListener("unique:certificates-change", animateDocuments);
        ScrollTrigger.refresh();
        return function () {
          document.removeEventListener("unique:certificates-change", animateDocuments);
          ScrollTrigger.removeEventListener("refreshInit", prepareStackRefresh);
          ScrollTrigger.removeEventListener("refresh", finishStackRefresh);
          finishStackRefresh();
          items.forEach(function (item, index) {
            if (previousTops[index]) item.style.setProperty("--stack-top", previousTops[index]);
            else item.style.removeProperty("--stack-top");
          });
          if (documentsMotion) documentsMotion.revert();
        };
      });
    }
    toggle.addEventListener("click", function () { localPaused = !localPaused; build(); });
    document.addEventListener("unique:motion-change", function (event) {
      globalPaused = event.detail.paused;
      build();
    });
    // Keyboard readers should not have to navigate behind overlapping cards.
    document.querySelector(".founder-stack").addEventListener("focusin", function (event) {
      if (event.target.matches(":focus-visible") && !localPaused) {
        localPaused = true;
        build();
      }
    });
    build();
    if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  function init() {
    initCertificatePreview();
    initViewer();
    initFounderMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
