const navShell = document.querySelector(".nav-shell");
const navToggle = document.querySelector(".nav-toggle");
const brandLogo = document.querySelector(".brand img");
const navLinks = Array.from(document.querySelectorAll("[data-nav-target]"));
const serviceTabs = Array.from(document.querySelectorAll("[data-service-tab]"));
const servicePanels = Array.from(document.querySelectorAll("[data-service-panel]"));
const workTabs = Array.from(document.querySelectorAll("[data-work-tab]"));
const workPanels = Array.from(document.querySelectorAll("[data-work-panel]"));
const workShowcases = Array.from(document.querySelectorAll(".work-showcase[data-project]"));
const observedSections = ["home", "about", "services", "work", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
let lockedNavTarget = "";
let unlockTimer = 0;

function finishPageLoading() {
  window.setTimeout(() => {
    document.body.classList.remove("is-loading");
  }, 320);
}

if (document.readyState === "complete") {
  finishPageLoading();
} else {
  window.addEventListener("load", finishPageLoading, { once: true });
}

const fixedScrollTargets = {
  home: 0,
  about: 1080,
  services: 2160,
  work: 3240,
};
const fixedScrollMedia = window.matchMedia("(min-width: 901px)");

function scrollToFixedTarget(target, behavior = "smooth") {
  if (!Object.hasOwn(fixedScrollTargets, target)) return;
  document.scrollingElement.scrollTo({
    top: fixedScrollTargets[target],
    behavior,
  });
}

function scrollToNavTarget(target, behavior = "smooth") {
  if (fixedScrollMedia.matches && Object.hasOwn(fixedScrollTargets, target)) {
    scrollToFixedTarget(target, behavior);
    return true;
  }

  const targetSection = document.getElementById(target);
  if (!targetSection) return false;
  const top = targetSection.getBoundingClientRect().top + window.scrollY;
  document.scrollingElement.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

const revealSelectors = [
  ".module-heading",
  ".info-row",
  ".experience",
  ".project-title",
  ".project-tag-row",
  ".skill-title",
  ".skill-item",
  ".about-figure",
  ".service-question",
  ".service-visual-card",
  ".service-block",
  ".ai-strip",
  ".scenario-card",
  ".process-list article",
  ".work-carousel",
  ".contact-title",
  ".contact-list",
];

const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(",")));

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.16,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function revealVisibleItems() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible") || item.closest("[hidden]")) return;
    const rect = item.getBoundingClientRect();
    if (rect.top < viewportHeight * 0.88 && rect.bottom > 0) {
      item.classList.add("is-visible");
      revealObserver.unobserve(item);
    }
  });
}

window.addEventListener("scroll", revealVisibleItems, { passive: true });
window.addEventListener("resize", revealVisibleItems);
window.setTimeout(revealVisibleItems, 80);

function revealInside(container) {
  container.querySelectorAll(".reveal").forEach((item, index) => {
    window.setTimeout(() => {
      item.classList.add("is-visible");
    }, index * 70);
  });
}

function setActiveNav(id) {
  if (!navShell) return;
  navShell.dataset.active = id;
  if (brandLogo) {
    if (id === "about") {
      brandLogo.src = brandLogo.dataset.aboutSrc;
    } else if (id === "work" || id === "contact") {
      brandLogo.src = brandLogo.dataset.servicesWorkSrc;
    } else {
      brandLogo.src = brandLogo.dataset.defaultSrc;
    }
  }
  navLinks.forEach((link) => {
    link.classList.toggle("active", id !== "download" && link.dataset.navTarget === id);
  });
}

function updateBottomNavState() {
  if (lockedNavTarget) return;
  const scrollElement = document.scrollingElement;
  const scrollTop = window.scrollY || scrollElement.scrollTop;
  const distanceToBottom = scrollElement.scrollHeight - window.innerHeight - scrollTop;
  if (distanceToBottom <= 24) {
    setActiveNav("contact");
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.dataset.navTarget;
    if (target) {
      if (target === "download") {
        event.preventDefault();
        if (navToggle) navToggle.checked = false;
        return;
      }

      if (scrollToNavTarget(target)) {
        event.preventDefault();
        history.replaceState(null, "", link.getAttribute("href"));
      }

      lockedNavTarget = target;
      setActiveNav(target);
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        lockedNavTarget = "";
      }, 1400);
    }
    if (navToggle) navToggle.checked = false;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    if (lockedNavTarget) return;

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      setActiveNav(visible.target.id);
    }
  },
  {
    rootMargin: "-28% 0px -52% 0px",
    threshold: [0.12, 0.28, 0.45, 0.62],
  }
);

observedSections.forEach((section) => observer.observe(section));
window.addEventListener("scroll", updateBottomNavState, { passive: true });
window.addEventListener("resize", updateBottomNavState);
updateBottomNavState();

function alignInitialHashToFixedTarget() {
  const params = new URLSearchParams(window.location.search);
  const hashTarget = window.location.hash.replace("#", "");
  const target = params.get("target") || hashTarget;
  if (!Object.hasOwn(fixedScrollTargets, target) && !document.getElementById(target)) return;

  window.requestAnimationFrame(() => {
    scrollToNavTarget(target, "auto");
    setActiveNav(target);
    revealVisibleItems();
  });
}

alignInitialHashToFixedTarget();

serviceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.serviceTab;

    serviceTabs.forEach((item) => {
      item.classList.toggle("active", item === tab);
    });

    servicePanels.forEach((panel) => {
      const active = panel.dataset.servicePanel === target;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
      if (active) revealInside(panel);
    });
  });
});

let activeWorkPanel = workPanels[0] || null;
let activeWorkSlide = 0;
let workSlideTimer = 0;
let workCarouselPaused = false;

function setWorkSlide(index) {
  if (!activeWorkPanel) return;
  const slides = Array.from(activeWorkPanel.querySelectorAll(".work-showcase"));
  if (!slides.length) return;
  activeWorkSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeWorkSlide;
    slide.classList.toggle("active", isActive);
    slide.tabIndex = isActive ? 0 : -1;
    slide.setAttribute("aria-hidden", String(!isActive));
  });
}

function restartWorkCarousel() {
  window.clearInterval(workSlideTimer);
  if (workCarouselPaused) return;
  if (!activeWorkPanel || activeWorkPanel.querySelectorAll(".work-showcase").length <= 1) return;
  workSlideTimer = window.setInterval(() => {
    setWorkSlide(activeWorkSlide + 1);
  }, 3600);
}

function pauseWorkCarousel() {
  workCarouselPaused = true;
  window.clearInterval(workSlideTimer);
}

function resumeWorkCarousel() {
  workCarouselPaused = false;
  restartWorkCarousel();
}

function setWorkPanel(id) {
  workTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.workTab === id);
  });

  workPanels.forEach((panel) => {
    const active = panel.dataset.workPanel === id;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
    if (active) {
      activeWorkPanel = panel;
      revealInside(panel);
    }
  });

  setWorkSlide(0);
  restartWorkCarousel();
}

workTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setWorkPanel(tab.dataset.workTab);
  });
});

workPanels.forEach((panel) => {
  panel.addEventListener("mouseenter", pauseWorkCarousel);
  panel.addEventListener("mouseleave", resumeWorkCarousel);
});

workShowcases.forEach((showcase) => {
  showcase.tabIndex = showcase.classList.contains("active") ? 0 : -1;
  showcase.role = "link";
  showcase.addEventListener("click", () => {
    window.location.href = `work-detail.html?project=${showcase.dataset.project}`;
  });
  showcase.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showcase.click();
    }
  });
});

if (activeWorkPanel) {
  setWorkPanel(activeWorkPanel.dataset.workPanel);
}
