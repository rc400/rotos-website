const body = document.body;
const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-panel a");
const revealItems = document.querySelectorAll(".reveal");
const photoUpload = document.querySelector("#photo-upload");
const fileFeedback = document.querySelector("#file-feedback");

const updateNavbarState = () => {
  if (!navbar) return;
  navbar.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeNav = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open menu");
};

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("scroll", updateNavbarState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth >= 960) closeNav();
});
updateNavbarState();

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

if (photoUpload && fileFeedback) {
  photoUpload.addEventListener("change", () => {
    const files = Array.from(photoUpload.files || []);

    fileFeedback.classList.remove("is-error", "is-success");

    if (files.length === 0) {
      fileFeedback.textContent = "";
      return;
    }

    if (files.length > 5) {
      photoUpload.value = "";
      fileFeedback.textContent = "Please upload up to 5 photos.";
      fileFeedback.classList.add("is-error");
      return;
    }

    fileFeedback.textContent = `${files.length} photo${files.length === 1 ? "" : "s"} selected.`;
    fileFeedback.classList.add("is-success");
  });
}
