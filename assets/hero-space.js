(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-starfield]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollProgress = 0;
  var stars = [];
  var meteors = [];
  var frame = 0;
  var meteorTimer = 0;
  var startedAt = performance.now();

  if (!canvas) {
    return;
  }

  var context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    return;
  }

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

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    makeStars(rect.width < 700 ? 150 : 260);
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

  function drawBackground(width, height) {
    context.fillStyle = "#050608";
    context.fillRect(0, 0, width, height);

    var redGlow = context.createRadialGradient(width * 0.88, height * 0.52, 0, width * 0.88, height * 0.52, width * 0.6);
    redGlow.addColorStop(0, "rgba(86,24,25,0.16)");
    redGlow.addColorStop(0.46, "rgba(48,18,22,0.06)");
    redGlow.addColorStop(1, "rgba(5,6,8,0)");
    context.fillStyle = redGlow;
    context.fillRect(0, 0, width, height);

    var goldGlow = context.createRadialGradient(width * 0.14, height * 0.12, 0, width * 0.14, height * 0.12, width * 0.42);
    goldGlow.addColorStop(0, "rgba(197,164,109,0.08)");
    goldGlow.addColorStop(1, "rgba(5,6,8,0)");
    context.fillStyle = goldGlow;
    context.fillRect(0, 0, width, height);
  }

  function drawStars(width, height, now) {
    stars.forEach(function (star) {
      var twinkle = reducedMotion ? 1 : 0.82 + Math.sin(now * 0.001 * star.speed + star.phase) * 0.18;
      var x = star.x * width;
      var y = (star.y + scrollProgress * 0.018) % 1 * height;
      var radius = Math.max(0.55, star.radius * Math.min(window.devicePixelRatio || 1, 1.6));
      context.globalAlpha = star.alpha * twinkle;
      context.fillStyle = star.color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
  }

  function drawMeteors(width, height, elapsed) {
    meteors = meteors.filter(function (meteor) {
      meteor.age += elapsed;
      meteor.x += meteor.vx * elapsed;
      meteor.y += meteor.vy * elapsed;

      var progress = meteor.age / meteor.life;
      var x = meteor.x * width;
      var y = meteor.y * height;
      var opacity = Math.sin(Math.min(1, progress) * Math.PI) * 0.78;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      var tailX = x - Math.sign(meteor.vx) * meteor.length * dpr;
      var tailY = y - meteor.length * 0.55 * dpr;
      var gradient = context.createLinearGradient(tailX, tailY, x, y);
      gradient.addColorStop(0, meteor.color + "0)");
      gradient.addColorStop(0.78, meteor.color + (opacity * 0.22).toFixed(3) + ")");
      gradient.addColorStop(1, meteor.color + opacity.toFixed(3) + ")");

      context.strokeStyle = gradient;
      context.lineWidth = meteor.width * Math.min(window.devicePixelRatio || 1, 1.6);
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(x, y);
      context.stroke();

      return progress < 1 && meteor.x > -0.3 && meteor.x < 1.3 && meteor.y < 1.25;
    });
  }

  function render(now) {
    var elapsed = Math.min(40, now - (render.last || now));
    render.last = now;
    var width = canvas.width;
    var height = canvas.height;

    context.save();
    context.translate(0, scrollProgress * height * 0.015);
    drawBackground(width, height);
    drawStars(width, height, now - startedAt);
    drawMeteors(width, height, elapsed);
    context.restore();

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(render);
    }
  }

  canvas.dataset.spaceRenderer = "canvas-starfield";
  resize();
  render(performance.now());
  scheduleMeteor();

  window.UNIQUE_FITNESS_SPACE = {
    setScroll: function (value) {
      scrollProgress = Math.max(0, Math.min(1, Number(value) || 0));
    },
    dispose: function () {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(meteorTimer);
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("beforeunload", function () {
    window.UNIQUE_FITNESS_SPACE.dispose();
  }, { once: true });
})();
