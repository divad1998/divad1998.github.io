(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  let motionOverride = null;
  try { motionOverride = localStorage.getItem('david-portfolio-motion'); } catch { /* Storage can be unavailable. */ }
  let motionPaused = motionOverride === 'paused' || (motionOverride !== 'playing' && reducedMotion.matches);

  function applyMotion() {
    root.classList.toggle('motion-paused', motionPaused);
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.setAttribute('aria-label', motionPaused ? 'Resume animations' : 'Pause animations');
    motionButton.title = motionPaused ? 'Resume animations' : 'Pause animations';
    // CSS cannot pause SVG animateMotion, so control its timeline too.
    document.querySelectorAll('svg.connections').forEach(svg => {
      if (motionPaused && svg.pauseAnimations) svg.pauseAnimations();
      else if (svg.unpauseAnimations) svg.unpauseAnimations();
    });
  }
  applyMotion();
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    motionOverride = motionPaused ? 'paused' : 'playing';
    try { localStorage.setItem('david-portfolio-motion', motionOverride); } catch { /* Optional preference. */ }
    applyMotion();
  });
  reducedMotion.addEventListener('change', event => {
    if (motionOverride === null) { motionPaused = event.matches; applyMotion(); }
  });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open navigation';
    mobileNav.hidden = true;
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
    mobileNav.hidden = !open;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => {
    if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  function wireTabs(selector, activate) {
    const tabs = [...document.querySelectorAll(selector)];
    function select(tab, focus = false) {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      activate(tab);
      if (focus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
      });
    });
  }
  const flows = {
    api: { command: 'GET /api/something-good', description: 'A clear request. A considered response. Good APIs make complexity feel simple.', status: 'REQUEST → RESPONSE', client: 'CLIENT', worker: 'LARAVEL', database: 'DATABASE' },
    queue: { command: 'dispatch(new DoTheHeavyLifting)', description: 'Keep the request light. Let a background job handle the work that can happen next.', status: 'DISPATCH → PROCESS', client: 'REQUEST', worker: 'WORKER', database: 'RESULT' },
    cache: { command: 'Cache::remember("the-good-stuff")', description: 'Fetch thoughtfully. Reuse what makes sense. Give the database a little breathing room.', status: 'LOOK UP → REUSE', client: 'REQUEST', worker: 'CACHE HIT', database: 'DATABASE' }
  };
  wireTabs('[data-flow-tab]', tab => {
    const mode = tab.dataset.flowTab;
    const flow = flows[mode];
    document.querySelector('.system-card').dataset.flow = mode;
    document.querySelector('#flow-panel').setAttribute('aria-labelledby', tab.id);
    document.querySelector('[data-flow-command]').textContent = flow.command;
    document.querySelector('[data-flow-description]').textContent = flow.description;
    document.querySelector('[data-flow-status]').textContent = flow.status;
    document.querySelector('[data-node-client]').textContent = flow.client;
    document.querySelector('[data-node-worker]').textContent = flow.worker;
    document.querySelector('[data-node-database]').textContent = flow.database;
  });
  const tools = {
    build: ['PHP', 'Laravel', 'Java', 'Spring Boot', 'TypeScript', 'Node.js'],
    data: ['MySQL', 'MariaDB', 'PostgreSQL', 'Redis / Valkey', 'AWS S3'],
    ship: ['Docker', 'Ubuntu / Linux', 'GitHub Actions', 'PHPUnit / Pest', 'Queues & Supervisor']
  };
  wireTabs('[data-tool-tab]', tab => {
    const panel = document.querySelector('#tools-panel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.replaceChildren(...tools[tab.dataset.toolTab].map(tool => {
      const item = document.createElement('span');
      item.textContent = tool;
      return item;
    }));
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -15px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
    root.classList.add('reveal-ready');
    const navLinks = [...document.querySelectorAll('.desktop-nav a')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = navLinks.find(item => item.getAttribute('href') === `#${entry.target.id}`);
        if (link) {
          if (entry.isIntersecting) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-10% 0px -60% 0px' });
    document.querySelectorAll('#work, #about, #contact').forEach(section => sectionObserver.observe(section));
  }
  const progress = document.querySelector('.scroll-progress');
  let scheduled = false;
  function updateProgress() {
    const height = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, window.scrollY / height) : 0})`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const copyButton = document.querySelector('.copy-email');
  let statusTimer;
  if (navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.querySelector('#copy-status');
      clearTimeout(statusTimer);
      try {
        await navigator.clipboard.writeText('divadchigozie@gmail.com');
        status.textContent = 'Copied. Talk soon!';
      } catch {
        status.textContent = 'Copy unavailable — select the email above.';
      }
      statusTimer = setTimeout(() => { status.textContent = ''; }, 4500);
    });
  }
  const clock = document.querySelector('[data-clock]');
  const clockFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: false });
  function updateClock() { clock.textContent = `${clockFormatter.format(new Date())} WAT`; }
  updateClock();
  setInterval(() => { if (!document.hidden) updateClock(); }, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });
  document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
})();
