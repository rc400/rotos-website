/**
 * ROTO's TCG — review form
 *
 * Posts straight to Supabase via the REST endpoint. No SDK, no build step.
 * Anti-spam: honeypot field + minimum time-on-form + server-side rate limiting
 * (see supabase/reviews-schema.sql).
 */
(function () {
  "use strict";

  var MIN_FILL_MS = 2500; // bots submit instantly; humans don't
  var loadedAt = Date.now();

  var form = document.getElementById("review-form");
  if (!form) return;

  var starRow = document.getElementById("star-row");
  var stars = Array.prototype.slice.call(starRow.querySelectorAll(".star"));
  var ratingLabel = document.getElementById("rating-label");
  var commentEl = document.getElementById("review-comment");
  var charCount = document.getElementById("char-count");
  var emailEl = document.getElementById("review-email");
  var nameEl = document.getElementById("review-name");
  var honeypot = document.getElementById("hp-website");
  var submitBtn = document.getElementById("review-submit");
  var statusEl = document.getElementById("form-status");
  var successEl = document.getElementById("review-success");
  var successDetail = document.getElementById("success-detail");

  var rating = 0;

  var LABELS = {
    0: "Tap a star to rate",
    1: "Not good",
    2: "Could be better",
    3: "Solid",
    4: "Really good",
    5: "Couldn't be better",
  };

  /* ---------------------------------------------------------------
   * Star rating
   * ------------------------------------------------------------- */
  function paint(value) {
    stars.forEach(function (star) {
      var v = Number(star.dataset.value);
      star.classList.toggle("is-filled", v <= value);
      star.setAttribute("aria-checked", v === rating ? "true" : "false");
      star.tabIndex = v === (rating || 1) ? 0 : -1;
    });
  }

  function setRating(value) {
    rating = value;
    paint(value);
    ratingLabel.textContent = LABELS[value];
    starRow.classList.remove("has-error");
  }

  stars.forEach(function (star) {
    var value = Number(star.dataset.value);

    star.addEventListener("click", function () {
      setRating(value);
    });

    star.addEventListener("mouseenter", function () {
      paint(value);
      ratingLabel.textContent = LABELS[value];
    });

    star.addEventListener("focus", function () {
      paint(value);
      ratingLabel.textContent = LABELS[value];
    });
  });

  starRow.addEventListener("mouseleave", function () {
    paint(rating);
    ratingLabel.textContent = LABELS[rating];
  });

  starRow.addEventListener("keydown", function (event) {
    var current = rating || 0;
    var next = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = Math.min(5, current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = Math.max(1, current - 1);
    } else if (event.key === " " || event.key === "Enter") {
      next = current || 1;
    }

    if (next !== null) {
      event.preventDefault();
      setRating(next);
      stars[next - 1].focus();
    }
  });

  paint(0);

  /* ---------------------------------------------------------------
   * Character counter
   * ------------------------------------------------------------- */
  if (commentEl && charCount) {
    commentEl.addEventListener("input", function () {
      charCount.textContent = commentEl.value.length + " / 2000";
    });
  }

  /* ---------------------------------------------------------------
   * Submit
   * ------------------------------------------------------------- */
  function setStatus(message, kind) {
    statusEl.textContent = message || "";
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function validEmail(value) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("");

    var config = window.ROTOS_SUPABASE || {};
    if (!config.url || !config.anonKey || config.anonKey.indexOf("PASTE_") === 0) {
      setStatus(
        "Reviews aren't wired up yet. If you're seeing this, let us know at rotostcg.ca.",
        "error"
      );
      return;
    }

    // Honeypot — a real person never sees this field
    if (honeypot && honeypot.value.trim() !== "") {
      // Pretend it worked. Don't tell the bot anything.
      showSuccess(false);
      return;
    }

    // Too fast to be human
    if (Date.now() - loadedAt < MIN_FILL_MS) {
      setStatus("Hold on just a second, then try again.", "error");
      return;
    }

    if (!rating) {
      starRow.classList.add("has-error");
      setStatus("Pick a star rating first.", "error");
      stars[0].focus();
      return;
    }

    if (!nameEl.value.trim()) {
      setStatus("Add your name so we know who left the review.", "error");
      nameEl.focus();
      return;
    }

    var email = emailEl.value.trim();
    if (email && !validEmail(email)) {
      setStatus("That email doesn't look right. Fix it or leave it blank.", "error");
      emailEl.focus();
      return;
    }

    var payload = {
      rating: rating,
      comment: commentEl.value.trim() || null,
      email: email || null,
      name: nameEl.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("");

    fetch(config.url + "/rest/v1/reviews", {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: "Bearer " + config.anonKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (response.ok) {
          showSuccess(Boolean(email));
          return;
        }
        return response.text().then(function (text) {
          if (text.indexOf("duplicate_submission") !== -1) {
            throw new Error("Looks like that review already came through.");
          }
          if (text.indexOf("rate_limited") !== -1) {
            throw new Error("You've left a few reviews today already. Try again tomorrow.");
          }
          throw new Error("Something went wrong on our end. Try again in a moment.");
        });
      })
      .catch(function (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit review";
        setStatus(error.message || "Couldn't send that. Check your connection and try again.", "error");
      });
  });

  function showSuccess(hasEmail) {
    form.hidden = true;
    successEl.hidden = false;

    successDetail.textContent = hasEmail
      ? "Your review is in and you're entered in the giveaway. Ron and Tom read every single one."
      : "Your review is in. Ron and Tom read every single one.";

    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
