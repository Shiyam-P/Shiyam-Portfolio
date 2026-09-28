/**
 * FUEL-INSPIRED DEVELOPER PORTFOLIO ENGINE
 * 60FPS Page-by-Page Animations & Performance Architecture
 * Shiyam | Full Stack Developer
 */

document.addEventListener('DOMContentLoaded', () => {
  initCinematicEntry();
  // Defer heavy UI work until after the intro finishes (or immediately if skipped)
});

/* ---------------- 0. CINEMATIC TEXT → INTERFACE REVEAL ---------------- */
const CINEMATIC_DESKTOP_MS = 4500;
const CINEMATIC_MOBILE_MS = 3400;
const CINEMATIC_COMPRESS_AT = 2300;
const CINEMATIC_MORPH_AT = 2900;
const CINEMATIC_COMPRESS_AT_MOBILE = 1750;
const CINEMATIC_MORPH_AT_MOBILE = 2200;

function splitCinematicNameChars() {
  const nameEl = document.getElementById('cinematicBrandName');
  if (!nameEl || nameEl.dataset.split === '1') return;

  const text = nameEl.textContent.trim();
  nameEl.setAttribute('aria-label', text);
  nameEl.innerHTML = Array.from(text).map((ch, i) => {
    if (ch === ' ') {
      return `<span class="cinematic-char cinematic-space" style="--i:${i}" aria-hidden="true">&nbsp;</span>`;
    }
    return `<span class="cinematic-char" style="--i:${i}" aria-hidden="true">${ch}</span>`;
  }).join('');
  nameEl.dataset.split = '1';
}

function finishCinematicEntry() {
  const body = document.body;
  if (!body) return;

  body.classList.remove('cinematic-entry', 'cinematic-playing', 'cinematic-compress', 'cinematic-morph');
  body.classList.add('cinematic-done');

  const stage = document.getElementById('cinematicStage');
  if (stage) stage.remove();

  bootPortfolioInteractions();
  settleReturnNavigation();
}

function settleReturnNavigation() {
  const isReturn = document.documentElement.classList.contains('portfolio-return');

  if (!isReturn) {
    try {
      // Only clear skip when this was a normal first-load intro finish
      // (keep flag if somehow still mid-return)
    } catch (e) { /* ignore */ }
    return;
  }

  document.documentElement.classList.remove('portfolio-return');

  document.querySelectorAll('.page-section').forEach((p) => {
    p.classList.add('reveal-page', 'is-revealed');
  });

  let sectionId = 'work';
  try {
    const stored = sessionStorage.getItem('portfolio-return-section');
    if (stored) sectionId = stored;
  } catch (e) { /* ignore */ }

  // URL hash wins (Back to Work uses #work; Contact nav uses #contact)
  if (window.location.hash && window.location.hash.length > 1) {
    sectionId = window.location.hash.slice(1);
  }
  if (!sectionId) sectionId = 'work';

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('from');
    url.hash = sectionId;
    window.history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
  } catch (e) { /* ignore */ }

  const target = document.getElementById(sectionId) || document.getElementById('work');
  if (!target) return;

  const headerOffset = 88;
  const lockScroll = () => {
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo(0, Math.max(0, top));
  };

  lockScroll();
  requestAnimationFrame(lockScroll);
  window.setTimeout(lockScroll, 0);
  window.setTimeout(lockScroll, 50);
  window.setTimeout(lockScroll, 150);
  window.setTimeout(lockScroll, 300);

  // Clear skip flags only after we've locked onto Work
  try {
    sessionStorage.removeItem('portfolio-skip-intro');
    sessionStorage.removeItem('portfolio-return-section');
  } catch (e) { /* ignore */ }
}

function markSkipIntroOnLeave() {
  try {
    sessionStorage.setItem('portfolio-skip-intro', '1');
    sessionStorage.setItem('portfolio-return-section', 'work');
  } catch (e) { /* ignore */ }
}

function initWorkDetailLinks() {
  document.querySelectorAll('a.scanner-cta[href*="projects"], a.work-box[href*="projects"]').forEach((link) => {
    link.addEventListener('click', markSkipIntroOnLeave);
  });
}

let portfolioBooted = false;
function bootPortfolioInteractions() {
  if (portfolioBooted) return;
  portfolioBooted = true;

  initKineticButtons();
  initScrollProgressBar();
  initStickyNavbar();
  initScrollIndicator();
  initPageByPageAnimations();
  initSectionTracker();
  initPageDotNav();
  initProjectModals();
  initResumeModal();
  initContactInteractions();
  initEducationStream();
  initKeyboardShortcuts();
  initWorkDetailLinks();
  initProjectScanner();

  // Mouse-heavy effects last — after first paint of the live UI
  requestAnimationFrame(() => {
    initGridParallax();
    initHeroCardTilt();
    initMouseSpotlights();
  });
}

function initCinematicEntry() {
  const body = document.body;
  if (!body) return;

  const shouldSkip = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.classList.contains('cinematic-skip')
    || document.documentElement.classList.contains('portfolio-return');

  let skipStorage = false;
  try {
    skipStorage = sessionStorage.getItem('portfolio-skip-intro') === '1';
  } catch (e) { /* ignore */ }

  if (shouldSkip || skipStorage) {
    document.documentElement.classList.add('cinematic-skip');
    if (skipStorage) document.documentElement.classList.add('portfolio-return');
    body.className = 'cinematic-done';
    finishCinematicEntry();
    return;
  }

  body.classList.remove('cinematic-done', 'cinematic-compress', 'cinematic-morph');
  body.classList.add('cinematic-entry', 'cinematic-playing');

  splitCinematicNameChars();

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const compressAt = isMobile ? CINEMATIC_COMPRESS_AT_MOBILE : CINEMATIC_COMPRESS_AT;
  const morphAt = isMobile ? CINEMATIC_MORPH_AT_MOBILE : CINEMATIC_MORPH_AT;
  const duration = isMobile ? CINEMATIC_MOBILE_MS : CINEMATIC_DESKTOP_MS;

  window.setTimeout(() => body.classList.add('cinematic-compress'), compressAt);
  window.setTimeout(() => body.classList.add('cinematic-morph'), morphAt);
  window.setTimeout(finishCinematicEntry, duration);
}

window.addEventListener('pageshow', (event) => {
  // Browser back from project: skip intro instead of replaying via bfcache reload
  if (event.persisted) {
    let skip = false;
    try {
      skip = sessionStorage.getItem('portfolio-skip-intro') === '1';
    } catch (e) { /* ignore */ }

    if (skip || document.documentElement.classList.contains('portfolio-return')) {
      document.documentElement.classList.add('cinematic-skip', 'portfolio-return');
      document.body.className = 'cinematic-done';
      const stage = document.getElementById('cinematicStage');
      if (stage) stage.remove();
      finishCinematicEntry();
      return;
    }
    window.location.reload();
  }
});

/* ---------------- 1. 60FPS SCROLL PROGRESS BAR ---------------- */
function initScrollProgressBar() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        bar.style.transform = `scaleX(${progress})`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ---------------- 2. PAGE-BY-PAGE SCROLL REVEALS ---------------- */
function initPageByPageAnimations() {
  const pages = document.querySelectorAll('.page-section');
  const isReturn = document.documentElement.classList.contains('portfolio-return');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Return from project detail / reduced-motion: show sections immediately
  if (isReturn || reduceMotion) {
    pages.forEach((p) => p.classList.add('reveal-page', 'is-revealed'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    pages.forEach(p => p.classList.add('is-revealed'));
    return;
  }

  const pageObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12
  });

  pages.forEach(p => {
    p.classList.add('reveal-page');
    pageObserver.observe(p);
  });
}

/* ---------------- 3. FUEL SECTION TRACKER (01 / 05) ---------------- */
const SECTION_NAMES = {
  hero: "INTRO",
  work: "PROJECTS",
  experience: "JOURNEY",
  contact: "COLLABORATE"
};

function initSectionTracker() {
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const dots = document.querySelectorAll('.page-dot');

  if (!sections.length) return;

  function updateActiveSection() {
    // Current viewport focal point (offset by header height)
    const focalPoint = window.scrollY + (window.innerHeight * 0.35);
    let currentSectionId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (focalPoint >= top && focalPoint < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Special edge cases for top and bottom of page
    if (window.scrollY < 120) {
      currentSectionId = 'hero';
    } else if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      currentSectionId = 'contact';
    }

    if (!currentSectionId) return;

    // Update nav links underline (e.g. #work -> '01 Work' active)
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update side dots (e.g. data-target="#work" active)
    dots.forEach(dot => {
      if (dot.getAttribute('data-target') === `#${currentSectionId}`) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // 60FPS passive scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateActiveSection, { passive: true });

  // Initial call on load
  updateActiveSection();
}

/* ---------------- 4. RIGHT-SIDE PAGE DOT NAV ---------------- */
function initPageDotNav() {
  const dots = document.querySelectorAll('.page-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('data-target');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ---------------- 5. MOUSE SPOTLIGHT (Fuel Signature Effect) ---------------- */
function initMouseSpotlights() {
  const cards = document.querySelectorAll('.project-card, .hero-visual-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  });
}

/* ---------------- 6. PROJECT DETAILS MODAL ---------------- */
const PROJECT_DETAILS = {
  aivaan: {
    title: "AivaanTech Platform",
    category: "Real-World Client Platform",
    tech: ["React.js", "JavaScript/JSX", "CSS", "Responsive Web Development"],
    link: "https://learn.aivaantech.com",
    highlights: [
      "Engineered responsive course-platform user interfaces using React.js for seamless presentation across desktop, tablet, and mobile browsers.",
      "Designed and implemented reusable, maintainable frontend components adhering to a strict component hierarchy.",
      "Organized course-discovery catalog pages with dynamic categorization and responsive grid layouts.",
      "Optimized layout breakpoints to deliver consistent performance and visual fidelity across all screen sizes.",
      "Maintained component-based UI architecture ensuring predictable state transitions and consistent user experience.",
      "Delivered real-world client-facing development work on an active commercial learning platform."
    ]
  },
  fraud: {
    title: "Preventing Financial Fraud in Net Banking",
    category: "Academic & Security Engineering Project",
    tech: ["AI Concepts", "Face Recognition", "Liveness Detection", "Cybersecurity", "Illusion PIN"],
    link: null,
    highlights: [
      "Engineered a multi-layer authentication approach combining facial biometric verification with Illusion PIN technology.",
      "Applied computer vision feature-extraction and real-time liveness-detection concepts to verify genuine presence.",
      "Formulated defensive algorithms to identify and block spoofing attempts involving photographs and replay attacks.",
      "Focused on banking-grade data protection, authentication reliability, and defense-in-depth principles."
    ]
  },
  car: {
    title: "Car Buying and Selling Web Application",
    category: "Full Stack Web Application",
    tech: ["HTML5", "CSS3", "JavaScript (ES6+)", "MySQL", "REST APIs"],
    link: null,
    highlights: [
      "Built a full-featured responsive car marketplace for vehicle browsing, listings, and classified inventory management.",
      "Implemented secure user authentication workflows and full CRUD operations for vehicle records.",
      "Integrated REST API endpoints to facilitate seamless client-server data flow and instant inventory updates.",
      "Leveraged native JavaScript ES6+ DOM manipulation for dynamic price filters, interactive modals, and real-time validation.",
      "Structured normalized MySQL database tables to safeguard data consistency across vehicle specifications."
    ]
  },
  sis: {
    title: "Student Information System",
    category: "Database-Driven Management Portal",
    tech: ["MySQL", "SQL Queries", "CRUD Operations", "Database Connectivity"],
    link: null,
    highlights: [
      "Architected a database-driven student management system for managing student records, attendance, and academic profiles.",
      "Formulated structured, optimized SQL queries for rapid lookup, filtering, and transactional reliability.",
      "Engineered complete CRUD operations supporting administrative workflows and error-free record management.",
      "Configured robust database connectivity routines and validation checks to protect data integrity."
    ]
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeProjectModal');
  const triggerBtns = document.querySelectorAll('.js-open-project');

  if (!modalOverlay) return;

  function openModal(projectId) {
    const data = PROJECT_DETAILS[projectId];
    if (!data) return;

    document.getElementById('modalProjectTitle').textContent = data.title;
    document.getElementById('modalProjectCategory').textContent = data.category;
    
    // Tech chips
    const techBox = document.getElementById('modalProjectTech');
    techBox.innerHTML = '';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.className = 'cap-tag';
      span.textContent = t;
      techBox.appendChild(span);
    });

    // Highlights list
    const list = document.getElementById('modalProjectHighlights');
    list.innerHTML = '';
    data.highlights.forEach(h => {
      const li = document.createElement('li');
      li.textContent = h;
      list.appendChild(li);
    });

    // Link
    const linkContainer = document.getElementById('modalProjectLinkContainer');
    if (data.link) {
      linkContainer.innerHTML = `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="btn btn-accent" style="font-size:12.5px;">Launch Live Platform: learn.aivaantech.com ↗</a>`;
      linkContainer.style.display = 'block';
      initKineticButtons(linkContainer);
    } else {
      linkContainer.style.display = 'none';
    }

    modalOverlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-project');
      openModal(pId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

/* ---------------- 8. ATS RESUME MODAL ---------------- */
function initResumeModal() {
  const resumeModal = document.getElementById('resumeModal');
  const openBtns = document.querySelectorAll('.js-open-resume-modal');
  const closeBtn = document.getElementById('closeResumeModal');

  if (!resumeModal) return;

  function openResume() {
    resumeModal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeResume() {
    resumeModal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openResume();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeResume);
  
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResume();
  });
}

/* ---------------- 8b. EDUCATION DATA STREAM (SCROLL-DRIVEN) ---------------- */
function initEducationStream() {
  const stream = document.getElementById('eduStream') || document.querySelector('[data-edu-stream]');
  if (!stream) return;

  const track = stream.querySelector('.edu-stream-track');
  const milestones = Array.from(stream.querySelectorAll('[data-edu-milestone]'));
  if (!track || !milestones.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  let activeIndex = -1;

  function setProgress(progress) {
    stream.style.setProperty('--edu-progress', String(Math.max(0, Math.min(1, progress))));
  }

  function updateActiveStates(nextIndex) {
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;

    milestones.forEach((milestone, index) => {
      const isActive = index === activeIndex;
      const isPassed = index < activeIndex;

      milestone.classList.toggle('is-active', isActive);
      milestone.classList.toggle('is-passed', isPassed);

      if ((isActive || isPassed) && !milestone.classList.contains('is-revealed')) {
        // Stagger reveal slightly after node activation for premium pacing
        window.setTimeout(() => {
          milestone.classList.add('is-revealed');
        }, prefersReducedMotion ? 0 : 90);
      }
    });
  }

  function updateStream() {
    const rect = track.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    const start = viewH * 0.72;
    const end = viewH * 0.28;
    const total = Math.max(1, rect.height + (start - end));
    const traveled = start - rect.top;
    const progress = traveled / total;
    setProgress(progress);

    // Activate milestone nearest to focal band
    const focalY = viewH * 0.42;
    let bestIndex = -1;
    let bestDist = Infinity;

    milestones.forEach((milestone, index) => {
      const mRect = milestone.getBoundingClientRect();
      const mid = mRect.top + mRect.height * 0.2;
      const dist = Math.abs(mid - focalY);

      // Only consider milestones that have entered the upper/mid viewport
      if (mRect.top < viewH * 0.78 && dist < bestDist) {
        bestDist = dist;
        bestIndex = index;
      }
    });

    // Keep first item active once stream has begun, even if slightly above focal
    if (bestIndex < 0 && progress > 0.08) bestIndex = 0;
    if (bestIndex >= 0) updateActiveStates(bestIndex);

    ticking = false;
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStream);
  }

  if (prefersReducedMotion) {
    setProgress(1);
    milestones.forEach((milestone, index) => {
      milestone.classList.add('is-revealed');
      if (index === 0) milestone.classList.add('is-active');
      else milestone.classList.add('is-passed');
    });
    return;
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  updateStream();
}

/* ---------------- 9. CONTACT / LET'S CONNECT (HORIZONTAL UNFOLD) ---------------- */
function initContactInteractions() {
  const panel = document.getElementById('connectPanel') || document.querySelector('.connect-panel');
  const trigger = document.getElementById('connectTrigger');
  const options = document.getElementById('connectOptions');

  if (!panel || !trigger || !options) return;

  let closeTimer = null;
  let readyTimer = null;
  let isAnimating = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLOSE_MS = prefersReducedMotion ? 20 : 400;
  const READY_MS = prefersReducedMotion ? 40 : 900;

  function setOpen(isOpen) {
    // Always allow close immediately — don't wait for open stagger to finish
    if (isAnimating && isOpen) return;

    trigger.setAttribute('aria-expanded', String(isOpen));

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (readyTimer) {
      window.clearTimeout(readyTimer);
      readyTimer = null;
    }

    if (isOpen) {
      panel.classList.remove('is-closing', 'is-ready');
      options.removeAttribute('hidden');
      isAnimating = true;

      const scan = panel.querySelector('.connect-scan');
      if (scan) {
        scan.style.animation = 'none';
        void scan.offsetWidth;
        scan.style.animation = '';
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.add('is-open');
          readyTimer = window.setTimeout(() => {
            panel.classList.add('is-ready');
            isAnimating = false;
            readyTimer = null;
          }, READY_MS);
        });
      });
      return;
    }

    // Smooth close: fade the whole panel out together, then hide
    isAnimating = true;
    panel.classList.remove('is-ready');
    panel.classList.add('is-closing');

    closeTimer = window.setTimeout(() => {
      panel.classList.remove('is-open', 'is-closing');
      options.setAttribute('hidden', '');
      isAnimating = false;
      closeTimer = null;
    }, CLOSE_MS);
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
    setOpen(willOpen);
  });

  document.addEventListener('click', (e) => {
    if (trigger.getAttribute('aria-expanded') !== 'true') return;
    if (panel.contains(e.target)) return;
    setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (trigger.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    trigger.focus();
  });
}

/* ---------------- 10. KEYBOARD SHORTCUTS ---------------- */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // ESC closes open modals
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.is-active');
      if (activeModal) {
        activeModal.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }

    // Keys 1-4 jump to sections if not typing in inputs
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    
    const keyMap = {
      '1': '#hero',
      '2': '#work',
      '3': '#about',
      '4': '#contact'
    };

    if (keyMap[e.key]) {
      const target = document.querySelector(keyMap[e.key]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

/* ---------------- 12. STICKY COMPACT NAVBAR ---------------- */
function initStickyNavbar() {
  const header = document.querySelector('.fuel-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

/* ---------------- 13. GRID BACKGROUND MOUSE PARALLAX (2-5px) ---------------- */
function initGridParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || 'ontouchstart' in window) return;
  const grid = document.querySelector('.fuel-grid-bg');
  if (!grid) return;

  let ticking = false;
  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const xOffset = ((e.clientX / window.innerWidth) - 0.5) * 5;
        const yOffset = ((e.clientY / window.innerHeight) - 0.5) * 5;
        grid.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ---------------- 14. HERO PROJECT CARD PREVIEW PARALLAX (no 3D tilt) ---------------- */
function initHeroCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || 'ontouchstart' in window) return;
  const card = document.getElementById('heroProjectCard');
  if (!card) return;
  const preview = card.querySelector('.product-window-preview');
  const wrapper = card.closest('.hero-project-card-wrapper');

  let ticking = false;
  card.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Extremely subtle mouse parallax on dashboard preview only (max ~6px)
        if (preview) {
          const paraX = ((x - centerX) / centerX) * 6;
          const paraY = ((y - centerY) / centerY) * 6;
          preview.style.transform = `translate3d(${paraX}px, ${paraY}px, 0)`;
        }

        if (wrapper) {
          wrapper.classList.add('is-hovering');
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  card.addEventListener('mouseleave', () => {
    if (preview) preview.style.transform = '';
    if (wrapper) wrapper.classList.remove('is-hovering');
  });
}

/* ---------------- 15. HERO SCROLL INDICATOR CLICK ---------------- */
function initScrollIndicator() {
  const indicator = document.querySelector('.hero-scroll-indicator');
  if (!indicator) return;

  indicator.addEventListener('click', () => {
    const work = document.getElementById('work');
    if (work) work.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------------- 16. KINETIC LETTERS BOUNCE/FLIP BUTTONS ---------------- */
function initKineticButtons(root = document) {
  const buttons = root.querySelectorAll('.btn, .hero-project-action');
  
  buttons.forEach(btn => {
    // Skip if already initialized
    if (btn.dataset.kineticReady === 'true') return;

    // Find any SVG icons within the button
    const svgIcon = btn.querySelector('svg');
    const svgClone = svgIcon ? svgIcon.cloneNode(true) : null;

    // Extract clean visible text content (excluding SVG)
    const clone = btn.cloneNode(true);
    clone.querySelectorAll('svg').forEach(s => s.remove());
    const text = clone.textContent.trim();

    if (!text) return;

    btn.dataset.kineticReady = 'true';
    btn.innerHTML = '';

    // 1. Static original layer (slides down on hover: translateY(100%))
    const originalLayer = document.createElement('span');
    originalLayer.className = 'btn-original';

    const origText = document.createElement('span');
    origText.className = 'btn-orig-text';
    origText.textContent = text;
    originalLayer.appendChild(origText);

    if (svgClone) {
      originalLayer.appendChild(svgClone.cloneNode(true));
    }

    // 2. Kinetic animated letters layer
    const lettersLayer = document.createElement('span');
    lettersLayer.className = 'btn-letters';
    lettersLayer.setAttribute('aria-hidden', 'true');

    const stream = document.createElement('span');
    stream.className = 'btn-char-stream';

    const chars = Array.from(text);
    const delayStep = 24; // 24ms per character for snappy stagger
    const maxDelay = 360; // Cap total delay

    chars.forEach((char, index) => {
      const charSpan = document.createElement('span');
      const delay = Math.min(index * delayStep, maxDelay);
      charSpan.style.setProperty('--char-delay', `${delay}ms`);

      if (char === ' ') {
        charSpan.className = 'btn-char btn-space';
        charSpan.innerHTML = '&nbsp;';
      } else {
        // Alternating vertical offsets: odd up (-15px), even down (+15px)
        const isUp = index % 2 === 0;
        charSpan.className = `btn-char ${isUp ? 'char-up' : 'char-down'}`;
        charSpan.textContent = char;
      }

      stream.appendChild(charSpan);
    });

    lettersLayer.appendChild(stream);

    // If there is an arrow/icon, animate it right after the characters
    if (svgClone) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'btn-icon-animated';
      const iconDelay = Math.min((chars.length + 1) * delayStep, maxDelay + 40);
      iconWrap.style.setProperty('--icon-delay', `${iconDelay}ms`);
      iconWrap.appendChild(svgClone);
      lettersLayer.appendChild(iconWrap);
    }

    btn.appendChild(originalLayer);
    btn.appendChild(lettersLayer);
  });
}

/* ---------------- 16. PROJECT SCANNER (SELECTED WORKS) ---------------- */
const PROJECT_SCANNER_DATA = [
  {
    id: 'aivaantech',
    num: '01',
    titleLines: ['AivaanTech', 'Platform'],
    category: 'Client Platform / Full-Stack Development',
    tech: ['React.js', 'Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'],
    description:
      'Client-facing learning platform with responsive interfaces, authentication workflows, course discovery, multilingual content, and database-driven functionality.',
    href: 'projects/aivaantech.html',
    preview: 'image',
    previewImage: 'assets/projects/aivaantech-preview.jpg?v=1',
    previewUrl: 'aivaantech.com'
  },
  {
    id: 'fraud-prevention',
    num: '02',
    titleLines: ['Net Banking', 'Fraud Prevention'],
    category: 'AI / Security',
    tech: ['Python', 'OpenCV', 'Machine Learning', 'Face Recognition'],
    description:
      'Multi-layer banking authentication system combining face recognition, liveness detection, and illusion PIN logic.',
    href: 'projects/fraud-prevention.html',
    preview: 'image',
    previewImage: 'assets/projects/fraud-prevention-preview.jpg?v=1',
    previewUrl: 'securebank.app'
  }
];

function initProjectScanner() {
  const root = document.getElementById('projectScanner');
  if (!root) return;

  const projects = PROJECT_SCANNER_DATA;
  const total = projects.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMq = window.matchMedia('(max-width: 768px)');

  const scrollTrack = root.querySelector('[data-scanner-scroll]');
  const stage = root.querySelector('[data-scanner-stage]');
  const titleEl = root.querySelector('[data-scanner-title]');
  const categoryEl = root.querySelector('[data-scanner-category]');
  const techEl = root.querySelector('[data-scanner-tech]');
  const descEl = root.querySelector('[data-scanner-desc]');
  const ctaEl = root.querySelector('[data-scanner-cta]');
  const preview = root.querySelector('[data-scanner-preview]');
  const previewUrl = root.querySelector('[data-scanner-preview-url]');
  const previewImg = root.querySelector('[data-scanner-preview-img]');
  const mobileStack = root.querySelector('[data-scanner-mobile]');

  let activeIndex = 0;
  let scanTimer = null;
  let rafScroll = false;

  function buildTechMarkup(tech) {
    return tech
      .map((item, i) => {
        const sep = i < tech.length - 1
          ? '<span class="scanner-tech-sep" aria-hidden="true">·</span>'
          : '';
        return `<span class="scanner-tech-item">${item}</span>${sep}`;
      })
      .join('');
  }

  function setPreviewType(project) {
    if (!preview) return;
    const type = project.preview;
    preview.setAttribute('data-preview-type', type);
    preview.classList.toggle('has-shot', type === 'image' && !!project.previewImage);

    preview.querySelectorAll('.preview-ui').forEach((ui) => {
      const match = ui.classList.contains(`preview-ui--${type}`);
      ui.hidden = !match;
    });

    if (type === 'image' && previewImg && project.previewImage) {
      previewImg.src = project.previewImage;
      previewImg.alt = `${project.titleLines.join(' ')} preview`;
    }
  }

  function renderProject(index, { animate = true } = {}) {
    const project = projects[index];
    if (!project || !stage) return;

    activeIndex = index;

    if (animate && !reduceMotion) {
      stage.classList.remove('is-active', 'is-ready', 'is-scanning');
      void stage.offsetWidth;
      stage.classList.add('is-scanning');
      if (scanTimer) window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(() => {
        stage.classList.remove('is-scanning');
      }, 900);
    }

    if (titleEl) {
      titleEl.innerHTML = project.titleLines
        .map((line) => `<span class="scanner-title-line" data-scanner-title-line>${line}</span>`)
        .join('');
    }

    if (categoryEl) categoryEl.textContent = project.category;
    if (techEl) techEl.innerHTML = buildTechMarkup(project.tech);
    if (descEl) descEl.textContent = project.description;
    if (ctaEl) {
      ctaEl.setAttribute('href', project.href);
      ctaEl.setAttribute('aria-label', `Inspect project: ${project.titleLines.join(' ')}`);
    }
    if (previewUrl) previewUrl.textContent = project.previewUrl;
    setPreviewType(project);

    requestAnimationFrame(() => {
      if (!stage) return;
      if (reduceMotion || !animate) {
        stage.classList.add('is-ready');
      } else {
        stage.classList.add('is-active');
      }
    });
  }

  function getMobilePreviewMarkup(project) {
    if (project.preview === 'image' && project.previewImage) {
      return `
        <div class="preview-ui preview-ui--image">
          <img class="scanner-preview-shot" src="${project.previewImage}" alt="${project.titleLines.join(' ')} preview" decoding="async" />
        </div>`;
    }
    if (project.preview === 'security') {
      return `
        <div class="preview-ui preview-ui--security">
          <div class="preview-auth-ring"><div class="preview-auth-core"></div></div>
          <div class="preview-auth-pins"><span></span><span></span><span></span><span></span></div>
          <div class="preview-auth-label">LAYERED AUTH</div>
        </div>`;
    }
    return `
      <div class="preview-ui preview-ui--platform">
        <div class="preview-sidebar"></div>
        <div class="preview-main">
          <div class="preview-hero-bar"></div>
          <div class="preview-cards"><span></span><span></span><span></span></div>
          <div class="preview-row"></div>
          <div class="preview-row preview-row--short"></div>
        </div>
      </div>`;
  }

  function buildMobileStack() {
    if (!mobileStack) return;
    const header = mobileStack.querySelector('.project-scanner-header');
    mobileStack.innerHTML = '';
    if (header) mobileStack.appendChild(header);

    projects.forEach((project) => {
      const scene = document.createElement('article');
      scene.className = 'scanner-mobile-scene';
      scene.innerHTML = `
        <h2 class="scanner-title">
          ${project.titleLines.map((l) => `<span class="scanner-title-line">${l}</span>`).join('')}
        </h2>
        <p class="scanner-category">${project.category}</p>
        <p class="scanner-tech">${buildTechMarkup(project.tech)}</p>
        <div class="scanner-preview${project.preview === 'image' ? ' has-shot' : ''}" data-preview-type="${project.preview}">
          ${project.preview === 'image' ? '' : `
          <div class="scanner-preview-chrome">
            <span class="scanner-preview-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="scanner-preview-url">${project.previewUrl}</span>
          </div>`}
          <div class="scanner-preview-body">
            ${getMobilePreviewMarkup(project)}
          </div>
        </div>
        <p class="scanner-desc">${project.description}</p>
        <a class="scanner-cta" href="${project.href}">
          <span class="scanner-cta-label">Inspect Project</span>
          <span class="scanner-cta-arrow" aria-hidden="true">↗</span>
        </a>
      `;
      mobileStack.appendChild(scene);
    });

    mobileStack.querySelectorAll('a.scanner-cta').forEach((link) => {
      link.addEventListener('click', markSkipIntroOnLeave);
    });
  }

  function getScrollIndex() {
    if (!scrollTrack) return 0;
    const rect = scrollTrack.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const stickyH = window.innerHeight;
    const scrollable = Math.max(scrollTrack.offsetHeight - stickyH, 1);
    const progress = (window.scrollY - trackTop) / scrollable;
    const clamped = Math.min(Math.max(progress, 0), 0.999);
    return Math.min(total - 1, Math.floor(clamped * total));
  }

  function onScroll() {
    if (mobileMq.matches || reduceMotion || !scrollTrack) return;
    if (rafScroll) return;
    rafScroll = true;
    requestAnimationFrame(() => {
      rafScroll = false;
      const next = getScrollIndex();
      if (next !== activeIndex) renderProject(next);
    });
  }

  function scrollToProject(index) {
    if (!scrollTrack || mobileMq.matches || reduceMotion) {
      const scenes = mobileStack && mobileStack.querySelectorAll('.scanner-mobile-scene');
      if (scenes && scenes[index]) {
        scenes[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    const rect = scrollTrack.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const stickyH = window.innerHeight;
    const scrollable = Math.max(scrollTrack.offsetHeight - stickyH, 1);
    const target = trackTop + ((index + 0.08) / total) * scrollable;
    window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  root.addEventListener('keydown', (e) => {
    if (mobileMq.matches) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToProject(Math.min(activeIndex + 1, total - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToProject(Math.max(activeIndex - 1, 0));
    }
  });

  root.setAttribute('tabindex', '0');

  buildMobileStack();
  renderProject(0, { animate: false });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

