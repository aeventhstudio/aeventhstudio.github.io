/* AEventh Studio – shared script for the studio pages.
   1) Language: one selector in the bottom bar; English default, German, RU/KZ placeholders (fall back to English).
      Menu: burger on small screens. Bottom bar: "Light" reveals the whole floor.
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
    var sel = document.getElementById("lang"); if (sel) sel.value = l;
    var note = document.getElementById("tr-note"); if (note) { note.hidden = !NOTE[l]; note.firstChild.textContent = NOTE[l] || ""; }
    try { localStorage.setItem("aeventh_lang", l); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem("aeventh_lang"); } catch (e) {}
  var nav = (navigator.languages || [navigator.language || "en"]).join(",").toLowerCase();
  apply(saved || (/^de|,de/.test(nav) ? "de" : "en"));
  var langSel = document.getElementById("lang"); if (langSel) langSel.addEventListener("change", function () { apply(langSel.value); });

  // menu: burger on small screens
  var burger = document.querySelector(".burger"), menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", String(o)); });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });
  }

  var cv = document.getElementById("dark"); if (!cv) return;
  var ctx = cv.getContext("2d"), S = 3, W = 0, H = 0, img, px;
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = matchMedia("(pointer: coarse)").matches, lightsOn = false, glob = 0;
  var ptr = { x: innerWidth * .7, y: innerHeight * .35, last: -1e9 }, auto = { x: 0, y: 0, vx: .6, vy: .4 };
  var lb = document.getElementById("lights");
  if (lb) lb.addEventListener("click", function () { lightsOn = !lightsOn; lb.setAttribute("aria-pressed", String(lightsOn)); });
  function size() { S = innerWidth < 760 ? 2 : 3; W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); cv.width = W; cv.height = H; cv.style.width = (W * S) + "px"; cv.style.height = (H * S) + "px"; img = ctx.createImageData(W, H); px = new Uint32Array(img.data.buffer); auto.x = W * .7; auto.y = H * .3; }
  size(); addEventListener("resize", size);
  // desktop: the light follows the mouse; touch screens: it always drifts on its own
  if (!coarse) addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.last = performance.now(); }, { passive: true });
  var last = 0;
  function frame(now) {
    requestAnimationFrame(frame); if (now - last < 40) return; last = now;
    var lx, ly;
    if (now - ptr.last < 4000) { lx = ptr.x / S; ly = ptr.y / S; auto.x = lx; auto.y = ly; }
    else { { var sp = reduce ? .5 : 1; auto.x += auto.vx * sp; auto.y += auto.vy * sp; if (auto.x < 20 || auto.x > W - 20) auto.vx *= -1; if (auto.y < 20 || auto.y > H - 20) auto.vy *= -1; } lx = auto.x; ly = auto.y; }
    glob += ((lightsOn ? 1 : 0) - glob) * .08;
    var R = 70 + Math.sin(now / 420) * 2, off = Math.floor(scrollY * .3 / S), gl = glob;
    for (var y = 0; y < H; y++) {
      var wy = y + off, dy = y - ly, by = (y & 3) * 4, cellY = (wy >> 4);
      for (var x = 0; x < W; x++) {
        var l = 1 - Math.sqrt((x - lx) * (x - lx) + dy * dy) / R, c = 0xff000000; if (gl > l) l = gl;
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
