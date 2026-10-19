/* AEventh Studio – shared script for the studio pages.
   1) Language: English default, German switch, RU/KZ placeholders (fall back to English).
      Strings: window.AE_DE = { key: "…" } on each page; elements carry data-i18n="key".
      Blocks with data-lang-block="de|en" (legal pages) are shown for the matching language.
   2) Darkness: a quiet floor of the game's checker cells, revealed by a dithered light
      that follows the pointer (or drifts on its own on touch screens). */
(function () {
  "use strict";
  var NOTE = { ru: "[RU: Übersetzung folgt – vorerst Englisch]", kk: "[KZ: Übersetzung folgt – vorerst Englisch]" };
  var nodes = document.querySelectorAll("[data-i18n]"), EN = {};
  nodes.forEach(function (n) { EN[n.getAttribute("data-i18n")] = n.textContent; });
  function apply(l) {
    var d = l === "de" ? (window.AE_DE || {}) : {};
    nodes.forEach(function (n) { var k = n.getAttribute("data-i18n"); n.textContent = d[k] != null ? d[k] : EN[k]; });
    document.querySelectorAll("[data-lang-block]").forEach(function (b) { b.hidden = b.getAttribute("data-lang-block") !== (l === "de" ? "de" : "en"); });
    document.documentElement.lang = l;
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    var note = document.getElementById("tr-note"); if (note) { note.hidden = !NOTE[l]; note.firstChild.textContent = NOTE[l] || ""; }
    try { localStorage.setItem("aeventh_lang", l); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("aeventh_lang"); } catch (e) {}
  var nav = (navigator.languages || [navigator.language || "en"]).join(",").toLowerCase();
  apply(saved || (/^de|,de/.test(nav) ? "de" : "en"));
  document.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.lang); }); });

  var cv = document.getElementById("dark"); if (!cv) return;
  var ctx = cv.getContext("2d"), S = 3, W = 0, H = 0, img, px;
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ptr = { x: innerWidth * .7, y: innerHeight * .35, last: -1e9 }, auto = { x: 0, y: 0, vx: .6, vy: .4 };
  function size() { S = innerWidth < 760 ? 2 : 3; W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); cv.width = W; cv.height = H; img = ctx.createImageData(W, H); px = new Uint32Array(img.data.buffer); auto.x = W * .7; auto.y = H * .3; }
  size(); addEventListener("resize", size);
  addEventListener("pointermove", function (e) { ptr.x = e.clientX; ptr.y = e.clientY; if (e.pointerType === "mouse") ptr.last = performance.now(); }, { passive: true });
  addEventListener("pointerdown", function (e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); }, { passive: true });
  var last = 0;
  function frame(now) {
    requestAnimationFrame(frame); if (now - last < 40) return; last = now;
    var lx, ly;
    if (now - ptr.last < 4000) { lx = ptr.x / S; ly = ptr.y / S; auto.x = lx; auto.y = ly; }
    else { if (!reduce) { auto.x += auto.vx; auto.y += auto.vy; if (auto.x < 20 || auto.x > W - 20) auto.vx *= -1; if (auto.y < 20 || auto.y > H - 20) auto.vy *= -1; } lx = auto.x; ly = auto.y; }
    var R = 70 + Math.sin(now / 420) * 2, off = Math.floor(scrollY * .3 / S);
    for (var y = 0; y < H; y++) {
      var wy = y + off, dy = y - ly, by = (y & 3) * 4, cellY = (wy >> 4);
      for (var x = 0; x < W; x++) {
        var l = 1 - Math.sqrt((x - lx) * (x - lx) + dy * dy) / R, c = 0xff000000;
        if (l > (BAYER[by + (x & 3)] + .5) / 16) {
          c = (((x >> 4) + cellY) & 1) ? 0xff0b0b0b : 0xff000000;
          if ((x & 15) === 0 && (wy & 15) === 0) c = 0xff373737;
        }
        px[y * W + x] = c;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  requestAnimationFrame(frame);
})();
