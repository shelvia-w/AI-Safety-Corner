/* ============================================================
   AI Safety Corner — Shared Nav + About Drawer
   Injects the shared navigation, moving world strip, and about
   drawer into every page.
   ============================================================ */

(function () {
  'use strict';

  const scriptSrc = document.currentScript?.getAttribute('src') || 'nav.js';
  const base = scriptSrc.startsWith('../') ? '../' : '';
  const logoHref = base ? '../index.html' : 'index.html';
  const currentPath = window.location.pathname;

  const navItems = [
    ['research-highlights', 'Research Highlights'],
    ['personal-notes', 'Personal Notes'],
    ['failure-cases', 'Failure Cases'],
    ['evaluation', 'Evaluation'],
    ['glossary', 'Glossary'],
    ['system-cards', 'System Cards'],
  ];

  const stripItems = [
    ['A little note from me:', 'focus on the journey, not the destination'],
    ['Currently rabbit-holing:', 'ai empire'],
    ['On my desk this week:', 'building things that matter'],
    ["Things I'm quietly thinking about:", 'learning and imagination'],
  ];

  function escHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function navLink([section, label]) {
    const isCurrent = currentPath.includes(`/${section}/`);
    const ariaCurrent = isCurrent ? ' aria-current="page"' : '';
    return `<a href="${base}${section}/index.html" class="nav-link"${ariaCurrent}>${escHtml(label)}</a>`;
  }

  function injectNav() {
    const placeholder = document.getElementById('site-nav');
    if (!placeholder) return;

    placeholder.outerHTML = `
      <nav class="site-nav">
        <div class="nav-inner">
          <a href="${logoHref}" class="nav-logo">
            <span class="logo-glyph">✤</span>
            <span class="logo-text">AI Safety Corner</span>
          </a>
          <div class="nav-links">
            ${navItems.map(navLink).join('')}
            <button class="nav-about-btn" id="aboutTrigger" aria-expanded="false" aria-controls="aboutDrawer">
              About
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  function buildStripInner() {
    return stripItems.map(([kicker, note]) => `
      <span class="world-strip-kicker">${escHtml(kicker)}</span>
      <span class="world-strip-note">${escHtml(note)}</span>
      <span class="strip-dot">◆</span>
    `).join('');
  }

  function injectWorldStrip() {
    const footer = document.querySelector('footer.site-footer');
    if (!footer || document.querySelector('.world-strip')) return;

    const stripInner = buildStripInner();
    footer.insertAdjacentHTML('beforebegin', `
      <div class="world-strip" aria-hidden="true">
        <div class="world-strip-track">
          <div class="world-strip-inner">${stripInner}</div>
          <div class="world-strip-inner">${stripInner}</div>
        </div>
      </div>
    `);
  }

  function injectAboutDrawer() {
    if (document.getElementById('aboutDrawer')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-overlay" id="drawerOverlay" aria-hidden="true"></div>

      <aside class="about-drawer" id="aboutDrawer" role="dialog" aria-label="About panel" aria-modal="true" aria-hidden="true">
        <div class="drawer-inner">
          <button class="drawer-close" id="drawerClose" aria-label="Close about panel">✕</button>

          <div class="drawer-header">
            <span class="drawer-kicker">A Little Introduction</span>
            <h2 class="drawer-title">About This Guide</h2>
          </div>

          <div class="drawer-section">
            <h3 class="drawer-section-title">The Project</h3>
            <p class="drawer-text">
              AI Safety Corner started as a personal project to dive deeper into AI safety research.
              Along the way, I thought, why not share some of what I'm learning too?
              It isn't affiliated with any lab or research institution — just one person's attempt
              to curate, explain, and explore a field that matters deeply to our future.
            </p>
          </div>

          <div class="drawer-section">
            <h3 class="drawer-section-title">About Me</h3>
            <p class="drawer-text">
              Hi there! My name is Shelvia. I'm a researcher based in Singapore,
              and I'm deeply passionate about AI safety. I created this site to share my
              learning journey and make the field a little more approachable for people
              just starting out. I'd love to connect with fellow AI safety enthusiasts.
            </p>
          </div>

          <div class="drawer-section">
            <h3 class="drawer-section-title">Behind the Build</h3>
            <p class="drawer-text">Vibe coded with the help of Codex and Claude Code.</p>
          </div>

          <div class="drawer-section">
            <h3 class="drawer-section-title">Contact</h3>
            <div class="drawer-links">
              <a href="https://www.linkedin.com/in/your-name" class="drawer-link" target="_blank" rel="noreferrer">
                <span class="drawer-link-icon">↗</span>
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/your-username" class="drawer-link" target="_blank" rel="noreferrer">
                <span class="drawer-link-icon">↗</span>
                <span>GitHub</span>
              </a>
              <a href="mailto:yourname@example.com" class="drawer-link">
                <span class="drawer-link-icon">↗</span>
                <span>Email</span>
              </a>
            </div>
          </div>

          <div class="drawer-footer">
            <span class="drawer-glyph" aria-hidden="true">✤</span>
            <span>AI Safety Corner — Made with ❤️</span>
          </div>
        </div>
      </aside>
    `);
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  injectNav();
  injectAboutDrawer();
  onReady(injectWorldStrip);
}());
