const body = document.body;
const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-panel a");
const revealItems = document.querySelectorAll(".reveal");
const parallaxRoot = document.querySelector("[data-parallax-root]");
const parallaxLogo = document.querySelector("[data-parallax-logo]");
const contactForm = document.querySelector("#contact-form");
const photoUpload = document.querySelector("#photo-upload");
const fileFeedback = document.querySelector("#file-feedback");
const emailPopup = document.querySelector("#email-popup");
const emailPopupClose = document.querySelector("#email-popup-close");

const EMAIL_POPUP_SESSION_KEY = "rotosEmailPopupDismissed";

const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isDesktopPointer = () =>
  window.matchMedia("(min-width: 960px) and (pointer: fine)").matches &&
  !isReducedMotion.matches;

const updateNavbarState = () => {
  if (!navbar) return;
  navbar.classList.toggle("is-scrolled", window.scrollY > 20);
};

const closeNav = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open navigation");
};

const openNav = () => {
  body.classList.add("nav-open");
  navToggle?.setAttribute("aria-expanded", "true");
  navToggle?.setAttribute("aria-label", "Close navigation");
};

const scrollToHash = (hash) => {
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: isReducedMotion.matches ? "auto" : "smooth", block: "start" });
};

const clearParallax = () => {
  if (!parallaxRoot || !parallaxLogo) return;
  parallaxRoot.style.transform = "";
  parallaxLogo.style.transform = "";
};

const dismissEmailPopup = () => {
  if (!emailPopup) return;
  emailPopup.classList.remove("is-visible");
  emailPopup.setAttribute("aria-hidden", "true");
  sessionStorage.setItem(EMAIL_POPUP_SESSION_KEY, "true");
};

const showEmailPopup = () => {
  if (!emailPopup) return;
  emailPopup.classList.add("is-visible");
  emailPopup.setAttribute("aria-hidden", "false");
};

if (navToggle) {
  navToggle.addEventListener("click", () => {
    if (body.classList.contains("nav-open")) {
      closeNav();
      return;
    }

    openNav();
  });
}

document.addEventListener("click", (event) => {
  if (!body.classList.contains("nav-open") || !navPanel || !navToggle) return;
  const clickedInsideMenu = navPanel.contains(event.target) || navToggle.contains(event.target);
  if (!clickedInsideMenu) closeNav();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    closeNav();
    scrollToHash(href);
    history.replaceState(null, "", href);
  });
});

navLinks.forEach((link) => link.addEventListener("click", closeNav));

window.addEventListener("scroll", updateNavbarState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth >= 960) closeNav();
  if (!isDesktopPointer()) clearParallax();
});
updateNavbarState();

if (emailPopup && !sessionStorage.getItem(EMAIL_POPUP_SESSION_KEY)) {
  const popupTriggerThreshold = 0.18;
  let hasShownEmailPopup = false;

  const handleEmailPopupTrigger = () => {
    if (hasShownEmailPopup) return;

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;

    const scrollProgress = window.scrollY / scrollableHeight;
    if (scrollProgress < popupTriggerThreshold) return;

    hasShownEmailPopup = true;
    showEmailPopup();
    window.removeEventListener("scroll", handleEmailPopupTrigger);
  };

  window.addEventListener("scroll", handleEmailPopupTrigger, { passive: true });
  handleEmailPopupTrigger();

  emailPopupClose?.addEventListener("click", dismissEmailPopup);
  emailPopup.querySelector("form")?.addEventListener("submit", () => {
    sessionStorage.setItem(EMAIL_POPUP_SESSION_KEY, "true");
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (parallaxRoot && parallaxLogo) {
  const handlePointerMove = (event) => {
    if (!isDesktopPointer()) return;

    const bounds = parallaxRoot.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 10;
    const driftX = (x - 0.5) * 18;
    const driftY = (y - 0.5) * 14;

    parallaxRoot.style.transform =
      "perspective(1000px) rotateX(" +
      rotateX.toFixed(2) +
      "deg) rotateY(" +
      rotateY.toFixed(2) +
      "deg)";
    parallaxLogo.style.transform =
      "translate3d(" + driftX.toFixed(2) + "px, " + driftY.toFixed(2) + "px, 24px)";
  };

  parallaxRoot.addEventListener("pointermove", handlePointerMove);
  parallaxRoot.addEventListener("pointerleave", clearParallax);
}

const setFieldState = (field) => {
  const isValid = field.checkValidity();
  field.classList.toggle("is-invalid", !isValid);
  return isValid;
};

if (contactForm) {
  const fields = contactForm.querySelectorAll("input[required], textarea[required]");

  fields.forEach((field) => {
    field.addEventListener("blur", () => setFieldState(field));
    field.addEventListener("input", () => {
      if (!field.classList.contains("is-invalid")) return;
      setFieldState(field);
    });
  });

  contactForm.addEventListener("submit", (event) => {
    let isFormValid = true;

    fields.forEach((field) => {
      if (!setFieldState(field)) isFormValid = false;
    });

    const files = Array.from(photoUpload?.files || []);
    const tooManyFiles = files.length > 5;

    if (photoUpload) {
      photoUpload.setCustomValidity(tooManyFiles ? "Please upload up to 5 photos." : "");
    }

    if (tooManyFiles && fileFeedback) {
      fileFeedback.textContent = "Please upload up to 5 photos.";
      fileFeedback.classList.remove("is-success");
      fileFeedback.classList.add("is-error");
    }

    if (!isFormValid || tooManyFiles) {
      event.preventDefault();
      const firstInvalid = contactForm.querySelector(".is-invalid");
      (firstInvalid || photoUpload)?.focus();
      contactForm.reportValidity();
    }
  });
}

if (photoUpload && fileFeedback) {
  photoUpload.addEventListener("change", () => {
    const files = Array.from(photoUpload.files || []);
    fileFeedback.classList.remove("is-error", "is-success");

    if (files.length === 0) {
      fileFeedback.textContent = "";
      return;
    }

    if (files.length > 5) {
      photoUpload.setCustomValidity("Please upload up to 5 photos.");
      photoUpload.value = "";
      fileFeedback.textContent = "Please upload up to 5 photos.";
      fileFeedback.classList.add("is-error");
      return;
    }

    photoUpload.setCustomValidity("");
    const names = files.map((file) => file.name).join(", ");
    fileFeedback.textContent =
      files.length + " photo" + (files.length === 1 ? "" : "s") + " selected: " + names;
    fileFeedback.classList.add("is-success");
  });
}

/* ── Hero Dots (elliptical field, shrinking with distance) ── */
(function generateHeroDots() {
  const container = document.querySelector(".hero-dots");
  if (!container) return;

  const totalDots = 48;
  const cx = 50; // center X %
  const cy = 50; // center Y %
  const radiusX = 46; // ellipse horizontal radius %
  const radiusY = 42; // ellipse vertical radius %
  const maxSize = 7; // biggest dot px (closest to center)
  const minSize = 1.5; // smallest dot px (furthest ring)
  const rings = 4; // concentric ellipse rings
  const dotsPerRing = Math.floor(totalDots / rings);

  for (let ring = 0; ring < rings; ring++) {
    const progress = (ring + 1) / rings; // 0.25 → 1.0 (inner to outer)
    const rx = radiusX * progress;
    const ry = radiusY * progress;
    const dotSize = maxSize - (maxSize - minSize) * progress;
    const opacity = 0.5 - 0.3 * progress; // inner brighter, outer fainter
    const count = dotsPerRing + (ring === rings - 1 ? totalDots % rings : 0);
    const angleOffset = (ring * Math.PI) / rings; // stagger each ring

    for (let i = 0; i < count; i++) {
      const angle = angleOffset + (i / count) * Math.PI * 2;
      // Add slight randomness so it doesn't look mechanical
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 4;
      const x = cx + rx * Math.cos(angle) + jitterX;
      const y = cy + ry * Math.sin(angle) + jitterY;

      const dot = document.createElement("div");
      dot.className = "hero-dot";
      dot.style.width = dotSize + "px";
      dot.style.height = dotSize + "px";
      dot.style.left = x + "%";
      dot.style.top = y + "%";
      dot.style.opacity = opacity;
      container.appendChild(dot);
    }
  }
})();
