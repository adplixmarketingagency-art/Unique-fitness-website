(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-starfield]");
  if (!canvas) {
    return;
  }

  var context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollProgress = 0;
  var stars = [];
  var meteors = [];
  var frame = 0;
  var meteorTimer = 0;
  var startedAt = performance.now();
  var lastFrame = startedAt;
  var width = 0;
  var height = 0;
  var dpr = 1;
  var visible = true;

  // The glow field never changes: paint it once into an offscreen canvas and
  // blit it each frame instead of rebuilding two full-screen gradients.
  var background = document.createElement("canvas");
  var backgroundContext = background.getContext("2d");

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeStars(count) {
    stars = Array.from({ length: count }, function () {
      var tone = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        radius: randomBetween(0.45, 1.55),
        alpha: randomBetween(0.18, 0.82),
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(0.35, 1.2),
        color: tone > 0.88 ? "#c45a52" : tone > 0.7 ? "#d9bc8b" : "#f5f5f2"
      };
    });
  }

  function paintBackground() {
    background.width = width;
    background.height = height;
    backgroundContext.fillStyle = "#050608";
    backgroundContext.fillRect(0, 0, width, height);

    var redGlow = backgroundContext.createRadialGradient(width * 0.88, height * 0.52, 0, width * 0.88, height * 0.52, width * 0.6);
    redGlow.addColorStop(0, "rgba(86,24,25,0.16)");
    redGlow.addColorStop(0.46, "rgba(48,18,22,0.06)");
    redGlow.addColorStop(1, "rgba(5,6,8,0)");
    backgroundContext.fillStyle = redGlow;
    backgroundContext.fillRect(0, 0, width, height);

    var goldGlow = backgroundContext.createRadialGradient(width * 0.14, height * 0.12, 0, width * 0.14, height * 0.12, width * 0.42);
    goldGlow.addColorStop(0, "rgba(197,164,109,0.08)");
    goldGlow.addColorStop(1, "rgba(5,6,8,0)");
    backgroundContext.fillStyle = goldGlow;
    backgroundContext.fillRect(0, 0, width, height);
  }

  // Measure the hero itself (not just the window): its height moves when the
  // mobile browser chrome collapses, and a stale bitmap is what made the
  // stars look stretched. Star positions are normalised, so a resize only
  // repaints the bitmap and never re-randomises the field.
  function measure() {
    var rect = canvas.getBoundingClientRect();
    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    var nextWidth = Math.max(1, Math.round(rect.width * nextDpr));
    var nextHeight = Math.max(1, Math.round(rect.height * nextDpr));

    if (nextWidth === width && nextHeight === height && nextDpr === dpr) {
      return;
    }

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = width;
    canvas.height = height;
    paintBackground();

    // Keep the freshly cleared bitmap painted even while the loop is idle
    // (reduced motion, hero off screen, or a resize mid-scroll).
    context.drawImage(background, 0, 0);
    drawStars(performance.now() - startedAt);
  }

  function scheduleMeteor() {
    if (reducedMotion) {
      return;
    }

    meteorTimer = window.setTimeout(function () {
      if (meteors.length < 2 && Math.random() > 0.22) {
        var direction = Math.random() > 0.5 ? 1 : -1;
        meteors.push({
          x: direction > 0 ? randomBetween(-0.1, 0.55) : randomBetween(0.45, 1.1),
          y: randomBetween(0.04, 0.45),
          vx: direction * randomBetween(0.0005, 0.0011),
          vy: randomBetween(0.00035, 0.00075),
          life: randomBetween(800, 1350),
          age: 0,
          length: randomBetween(32, 78),
          width: randomBetween(0.8, 1.6),
          color: Math.random() > 0.45 ? "rgba(245,245,242," : "rgba(196,90,82,"
        });
      }
      scheduleMeteor();
    }, randomBetween(2100, 4800));
  }

  function drawStars(now) {
    var offset = scrollProgress * height * 0.06;

    for (var i = 0; i < stars.length; i += 1) {
      var star = stars[i];
      var twinkle = reducedMotion ? 1 : 0.82 + Math.sin(now * 0.001 * star.speed + star.phase) * 0.18;
      var x = star.x * width;
      var y = (star.y * height + offset) % height;
      var radius = Math.max(0.55, star.radius * dpr);

      context.globalAlpha = star.alpha * twinkle;
      context.fillStyle = star.color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function drawMeteors(elapsed) {
    for (var i = meteors.length - 1; i >= 0; i -= 1) {
      var meteor = meteors[i];
      meteor.age += elapsed;
      meteor.x += meteor.vx * elapsed;
      meteor.y += meteor.vy * elapsed;

      var progress = meteor.age / meteor.life;
      var x = meteor.x * width;
      var y = meteor.y * height;
      var opacity = Math.sin(Math.min(1, progress) * Math.PI) * 0.78;
      var tailX = x - Math.sign(meteor.vx) * meteor.length * dpr;
      var tailY = y - meteor.length * 0.55 * dpr;
      var gradient = context.createLinearGradient(tailX, tailY, x, y);
      gradient.addColorStop(0, meteor.color + "0)");
      gradient.addColorStop(0.78, meteor.color + (opacity * 0.22).toFixed(3) + ")");
      gradient.addColorStop(1, meteor.color + opacity.toFixed(3) + ")");

      context.strokeStyle = gradient;
      context.lineWidth = meteor.width * dpr;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(x, y);
      context.stroke();

      if (progress >= 1 || meteor.x < -0.3 || meteor.x > 1.3 || meteor.y > 1.25) {
        meteors.splice(i, 1);
      }
    }
  }

  function render(now) {
    if (!visible) {
      frame = 0;
      return;
    }

    var elapsed = Math.min(34, Math.max(0, now - lastFrame));
    lastFrame = now;

    context.drawImage(background, 0, 0);
    drawStars(now - startedAt);
    drawMeteors(elapsed);

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(render);
    }
  }

  canvas.dataset.spaceRenderer = "canvas-starfield";
  makeStars(window.innerWidth < 700 ? 150 : 240);
  measure();
  render(startedAt);
  scheduleMeteor();

  // Track the hero's own box, so mobile browser chrome and content reflow
  // never leave a stale, stretched bitmap behind.
  if ("ResizeObserver" in window) {
    var resizeObserver = new ResizeObserver(function () {
      measure();
    });
    resizeObserver.observe(canvas.parentElement || canvas);
  }

  window.addEventListener("resize", measure, { passive: true });

  // Stop the loop entirely while the hero is off screen.
  if ("IntersectionObserver" in window) {
    var visibilityObserver = new IntersectionObserver(
      function (entries) {
        visible = entries[0].isIntersecting;

        if (visible && !frame) {
          lastFrame = performance.now();

          if (reducedMotion) {
            render(lastFrame);
          } else {
            frame = window.requestAnimationFrame(render);
          }
        }
      },
      { rootMargin: "120px 0px" }
    );
    visibilityObserver.observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    lastFrame = performance.now();
  });

  window.UNIQUE_FITNESS_SPACE = {
    setScroll: function (value) {
      scrollProgress = Math.max(0, Math.min(1, Number(value) || 0));
    },
    dispose: function () {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(meteorTimer);
    }
  };

  window.addEventListener("beforeunload", function () {
    window.UNIQUE_FITNESS_SPACE.dispose();
  }, { once: true });
})();
