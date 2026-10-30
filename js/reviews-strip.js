/**
 * ROTO's TCG: homepage review ticker.
 * Pulls approved 5-star reviews that have a comment from the public_reviews
 * view (names are already shortened server-side). Hidden if nothing loads.
 */
(function () {
  "use strict";

  var strip = document.getElementById("review-strip");
  var config = window.ROTOS_SUPABASE || {};
  if (!strip || !config.url || !config.anonKey) return;

  var track = strip.querySelector(".review-strip__track");
  var PX_PER_SECOND = 30;
  var MAX_FONT = 18.4; // px, matches 1.15rem
  var READABLE_FONT = 14;
  var MIN_FONT = 12;
  var reviews = [];

  // Fit each whole comment in its card: shrink to a readable size, then widen
  // the card, then shrink a little more only if it still doesn't fit.
  function fitText(list) {
    var maxWidth = Math.min(window.innerWidth * 0.85, 560);
    list.querySelectorAll(".review-strip__item").forEach(function (item) {
      var q = item.querySelector(".review-strip__quote");
      var over = function () { return q.scrollHeight > q.clientHeight + 1; };
      var size = MAX_FONT;
      item.style.width = "";
      item.style.height = "";
      q.style.fontSize = size + "px";
      while (over() && size > READABLE_FONT) { size -= 0.5; q.style.fontSize = size + "px"; }
      var width = item.getBoundingClientRect().width;
      while (over() && width < maxWidth) { width = Math.min(width + 24, maxWidth); item.style.width = width + "px"; }
      while (over() && size > MIN_FONT) { size -= 0.5; q.style.fontSize = size + "px"; }
      // Last resort on small screens: make the card taller
      var height = item.getBoundingClientRect().height;
      while (over() && height < 600) { height += 16; item.style.height = height + "px"; }
    });
    // Keep every card in the row the same height
    var tallest = 0;
    list.querySelectorAll(".review-strip__item").forEach(function (item) {
      tallest = Math.max(tallest, item.getBoundingClientRect().height);
    });
    list.querySelectorAll(".review-strip__item").forEach(function (item) {
      item.style.height = tallest + "px";
    });
  }

  function buildList(hidden) {
    var ul = document.createElement("ul");
    ul.className = "review-strip__list";
    if (hidden) ul.setAttribute("aria-hidden", "true");
    reviews.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "review-strip__item";

      var stars = document.createElement("span");
      stars.className = "review-strip__stars";
      stars.setAttribute("aria-label", "5 out of 5 stars");
      stars.textContent = "★★★★★";

      var quote = document.createElement("q");
      quote.className = "review-strip__quote";
      quote.textContent = r.comment;

      var name = document.createElement("span");
      name.className = "review-strip__name";
      name.textContent = r.display_name;

      li.appendChild(stars);
      li.appendChild(quote);
      li.appendChild(name);
      ul.appendChild(li);
    });
    return ul;
  }

  function render() {
    track.textContent = "";
    var first = buildList(false);
    track.appendChild(first);

    // Repeat until one copy is wider than the screen, so the loop never shows a gap
    var guard = 0;
    while (first.scrollWidth < window.innerWidth * 1.2 && guard < 20) {
      buildList(true).querySelectorAll("li").forEach(function (li) {
        first.appendChild(li);
      });
      guard++;
    }

    fitText(first);

    var copy = first.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);

    strip.style.setProperty("--strip-duration", first.scrollWidth / PX_PER_SECOND + "s");
  }

  var query =
    "/rest/v1/public_reviews?select=comment,display_name" +
    "&rating=eq.5&comment=not.is.null&order=created_at.desc&limit=30";

  fetch(config.url + query, {
    headers: { apikey: config.anonKey, Authorization: "Bearer " + config.anonKey },
  })
    .then(function (res) {
      return res.ok ? res.json() : [];
    })
    .then(function (rows) {
      reviews = (rows || []).filter(function (r) {
        return r.comment && r.display_name;
      });
      if (!reviews.length) return;
      strip.hidden = false;
      render();

      var timer;
      window.addEventListener("resize", function () {
        clearTimeout(timer);
        timer = setTimeout(render, 250);
      });
    })
    .catch(function () {
      /* stay hidden */
    });
})();
