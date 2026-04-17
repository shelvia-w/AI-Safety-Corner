/* ============================================================
   AI Safety Corner — Main JS
   Starfield, drawer interactions, nav scroll state, scroll reveal,
   and homepage zone hover effects.
   ============================================================ */

/* ─── Starfield ────────────────────────────────────────────── */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const STAR_COUNT = 200;
  const PARTICLE_COUNT = 14;

  let width = 0;
  let height = 0;
  let stars = [];
  let animId = null;

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      type: 'star',
      x: randomRange(0, width),
      y: randomRange(0, height),
      r: randomRange(0.3, 1.2),
      alpha: randomRange(0.1, 0.7),
      alphaTarget: randomRange(0.1, 0.7),
      alphaSpeed: randomRange(0.003, 0.012),
      color: Math.random() > 0.7 ? '#c5b8f5' : Math.random() > 0.5 ? '#5b8af5' : '#ffffff',
    };
  }

  function createParticle() {
    return {
      type: 'particle',
      x: randomRange(0, width),
      y: randomRange(0, height),
      r: randomRange(1.5, 3.5),
      alpha: randomRange(0.05, 0.2),
      alphaTarget: randomRange(0.05, 0.2),
      alphaSpeed: randomRange(0.002, 0.006),
      vx: randomRange(-0.08, 0.08),
      vy: randomRange(-0.06, 0.06),
      color: Math.random() > 0.5 ? '#c5b8f5' : '#f03e8a',
    };
  }

  function initStars() {
    stars = [
      ...Array.from({ length: STAR_COUNT }, createStar),
      ...Array.from({ length: PARTICLE_COUNT }, createParticle),
    ];
  }

  function wrapParticle(star) {
    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;
  }

  function drawParticle(star) {
    star.x += star.vx;
    star.y += star.vy;
    wrapParticle(star);

    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStar(star) {
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateAlpha(star) {
    if (Math.abs(star.alpha - star.alphaTarget) < 0.005) {
      star.alphaTarget = randomRange(0.05, star.type === 'star' ? 0.75 : 0.25);
    }
    star.alpha += (star.alphaTarget - star.alpha) * star.alphaSpeed;
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      updateAlpha(star);
      ctx.save();
      ctx.globalAlpha = star.alpha;
      if (star.type === 'particle') {
        drawParticle(star);
      } else {
        drawStar(star);
      }
      ctx.restore();
    });

    animId = requestAnimationFrame(drawFrame);
  }

  function init() {
    resize();
    initStars();
    if (animId) cancelAnimationFrame(animId);
    drawFrame();
  }

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });

  init();
}());


/* ─── About drawer ─────────────────────────────────────────── */
(function () {
  'use strict';

  const drawer = document.getElementById('aboutDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');
  const triggers = document.querySelectorAll('#aboutTrigger');

  if (!drawer || !overlay || !closeBtn || triggers.length === 0) return;

  function setDrawerOpen(isOpen) {
    drawer.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    overlay.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    if (isOpen) closeBtn.focus();
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => setDrawerOpen(true));
  });

  closeBtn.addEventListener('click', () => setDrawerOpen(false));
  overlay.addEventListener('click', () => setDrawerOpen(false));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawerOpen(false);
    }
  });
}());


/* ─── Nav scroll state ─────────────────────────────────────── */
(function () {
  'use strict';

  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  function updateNavState() {
    const isScrolled = window.scrollY > 40;
    nav.classList.toggle('is-scrolled', isScrolled);
  }

  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();
}());


/* ─── Scroll reveal ────────────────────────────────────────── */
(function () {
  'use strict';

  const revealSelectors = ['.featured-card', '.zone', '.signal', '.section-header'];
  const revealEls = revealSelectors.flatMap(selector => [...document.querySelectorAll(selector)]);

  if (revealEls.length === 0) return;

  revealEls.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 5) * 0.07}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}());


/* ─── Zone hover glow cursor effect ───────────────────────── */
(function () {
  'use strict';

  document.querySelectorAll('.zone').forEach(zone => {
    zone.addEventListener('mousemove', event => {
      const rect = zone.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      zone.style.setProperty('--mx', `${x}%`);
      zone.style.setProperty('--my', `${y}%`);
    });
  });
}());
