(() => {
  const root = document.documentElement;
  root.classList.add('js-ready');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: mobile menu + scroll-edge effect ---------- */
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileNav.classList.toggle('open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Local time in Moratuwa ---------- */
  const clock = document.querySelector('.local-time');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo' });
    const tick = () => { clock.textContent = `${fmt.format(new Date())} · GMT+5:30`; };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (typeof IntersectionObserver === 'undefined') {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    if (reduced) {
      reveals.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Proximity magnify: cards swell as the cursor approaches ----------
     Each card owns critically damped springs (no overshoot — hover carries no
     momentum), so it always moves from its live value and can reverse at any
     instant. The card also leans a few px toward the pointer, hinting where
     attention is heading. */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduced) {
    root.classList.add('magnet');
    const RADIUS = 140;                         // px of influence outside the card
    const RESPONSE = .32;
    const K = (2 * Math.PI / RESPONSE) ** 2;
    const C = 4 * Math.PI / RESPONSE;           // damping ratio 1.0
    const cards = [...document.querySelectorAll('[data-magnet]')].map((el) => ({
      el, s: 1, vs: 0, tx: 0, vtx: 0, ty: 0, vty: 0, g: 0, vg: 0, near: false,
    }));
    let px = -1e4, py = -1e4, pressed = null, raf = 0, last = 0;

    const spring = (x, v, target, dt) => {
      v += (-K * (x - target) - C * v) * dt;
      return [x + v * dt, v];
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30) / 2;
      last = now;
      let moving = false;
      const vh = window.innerHeight;
      for (const c of cards) {
        const r = c.el.getBoundingClientRect();
        let f = 0, nx = 0, ny = 0;
        if (r.bottom > -RADIUS && r.top < vh + RADIUS) {
          // Distance from pointer to the card's edge (0 when inside)
          const dx = Math.max(r.left - px, 0, px - r.right);
          const dy = Math.max(r.top - py, 0, py - r.bottom);
          const d = Math.hypot(dx, dy);
          f = Math.max(0, 1 - d / RADIUS);
          f = f * f * (3 - 2 * f);              // smoothstep falloff
          nx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (r.width / 2)));
          ny = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (r.height / 2)));
          c.el.style.setProperty('--mx', `${px - r.left}px`);
          c.el.style.setProperty('--my', `${py - r.top}px`);
        }
        // Grow by ~a fixed number of pixels, so big cards don't balloon
        const grow = Math.min(.045, 26 / Math.max(r.width, 1));
        const press = pressed === c.el ? .975 : 1;
        const ts = (1 + grow * f) * press;
        const ttx = nx * 5 * f, tty = ny * 4 * f;
        for (let i = 0; i < 2; i++) {
          [c.s, c.vs] = spring(c.s, c.vs, ts, dt);
          [c.tx, c.vtx] = spring(c.tx, c.vtx, ttx, dt);
          [c.ty, c.vty] = spring(c.ty, c.vty, tty, dt);
          [c.g, c.vg] = spring(c.g, c.vg, f, dt);
        }
        c.el.style.scale = c.s.toFixed(4);
        c.el.style.transform = `translate(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px)`;
        c.el.style.setProperty('--glow', Math.max(0, c.g).toFixed(3));
        const near = f > .02;
        if (near !== c.near) { c.near = near; c.el.classList.toggle('is-near', near); }
        if (Math.abs(c.s - ts) > .0005 || Math.abs(c.vs) > .001 || Math.abs(c.tx - ttx) > .05 || Math.abs(c.ty - tty) > .05 || Math.abs(c.g - f) > .005) moving = true;
      }
      raf = moving ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX; py = e.clientY; kick();
    }, { passive: true });
    window.addEventListener('scroll', kick, { passive: true });
    root.addEventListener('mouseleave', () => { px = py = -1e4; kick(); });
    window.addEventListener('blur', () => { px = py = -1e4; pressed = null; kick(); });
    // Press feedback fires on pointer-down, not on release
    document.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('a.card[data-magnet]');
      if (card) { pressed = card; kick(); }
    });
    window.addEventListener('pointerup', () => { if (pressed) { pressed = null; kick(); } });
  }

  /* ---------- Carousel: 1:1 drag, momentum projection, interruptible springs ---------- */
  const carousel = document.querySelector('.life');
  if (!carousel) return;
  const viewport = carousel.querySelector('.life-viewport');
  const track = carousel.querySelector('.life-track');
  const slides = [...track.children];
  const count = carousel.querySelector('.life-count');
  const last = slides.length - 1;

  let width = viewport.clientWidth;
  let x = 0;          // presentation value (what's on screen)
  let v = 0;          // px/s
  let index = 0;
  let raf = 0;

  const render = () => { track.style.transform = `translate3d(${x}px,0,0)`; };
  const pad = (n) => String(n).padStart(2, '0');
  const setIndex = (i) => {
    index = i;
    count.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
    slides.forEach((s, n) => s.setAttribute('aria-hidden', String(n !== index)));
  };

  // Apple's spring parameters: damping ratio + response (seconds)
  const springTo = (target, { damping = 1, response = .4, velocity = v } = {}) => {
    cancelAnimationFrame(raf);
    v = velocity;
    const k = (2 * Math.PI / response) ** 2;
    const c = (4 * Math.PI * damping) / response;
    let prev = performance.now();
    const step = (now) => {
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;
      for (let i = 0; i < 4; i++) {           // substeps for stability
        const h = dt / 4;
        v += (-k * (x - target) - c * v) * h;
        x += v * h;
      }
      if (Math.abs(x - target) < .5 && Math.abs(v) < 10) { x = target; v = 0; render(); return; }
      render();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const goTo = (i, opts) => {
    setIndex((i + slides.length) % slides.length);
    const target = -index * width;
    if (reduced) {
      // Gentle cross-fade instead of a slide
      cancelAnimationFrame(raf);
      x = target; v = 0; render();
      track.animate?.([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      return;
    }
    springTo(target, opts);
  };

  // Projection from Apple's Designing Fluid Interfaces sample
  const project = (velocity, rate = .998) => (velocity / 1000) * rate / (1 - rate);
  const rubberband = (over, dim, c = .55) => (over * dim * c) / (dim + c * Math.abs(over));

  let drag = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(raf);                  // grab it mid-flight, from where it is now
    drag = { id: e.pointerId, startX: e.clientX, startY: e.clientY, originX: x, startIndex: index, live: false, history: [] };
    stopAuto();
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.live) {
      if (Math.hypot(dx, dy) < 8) return;       // hysteresis before committing to a direction
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; startAuto(); return; }
      drag.live = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    }
    let next = drag.originX + dx;
    const min = -last * width;
    if (next > 0) next = rubberband(next, width);
    else if (next < min) next = min + rubberband(next - min, width);
    x = next;
    render();
    drag.history.push({ x: e.clientX, t: e.timeStamp });
    if (drag.history.length > 6) drag.history.shift();
  });
  const release = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    viewport.classList.remove('is-dragging');
    if (!d.live) { startAuto(); return; }
    const h = d.history;
    let velocity = 0;
    if (h.length > 1) {
      const a = h[0], b = h[h.length - 1];
      const dt = (b.t - a.t) / 1000;
      if (dt > 0 && e.timeStamp - b.t < 100) velocity = (b.x - a.x) / dt;
    }
    // Choose the target from where the flick is going, one page at most
    const projected = x + project(velocity);
    let target = Math.round(-projected / width);
    target = Math.max(d.startIndex - 1, Math.min(d.startIndex + 1, target));
    target = Math.max(0, Math.min(last, target));
    setIndex(target);
    const flicked = Math.abs(velocity) > 300;
    springTo(-target * width, { velocity, damping: flicked ? .85 : 1, response: .4 });
    startAuto();
  };
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);

  carousel.querySelector('.life-prev').addEventListener('click', () => { goTo(index - 1, { velocity: 0 }); restartAuto(); });
  carousel.querySelector('.life-next').addEventListener('click', () => { goTo(index + 1, { velocity: 0 }); restartAuto(); });
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(index - 1, { velocity: 0 }); restartAuto(); }
    if (e.key === 'ArrowRight') { goTo(index + 1, { velocity: 0 }); restartAuto(); }
  });

  // Auto-advance, paused whenever the person is engaged with it
  let timer = 0;
  let hovering = false;
  function stopAuto() { clearInterval(timer); timer = 0; }
  function startAuto() {
    if (reduced || hovering || document.hidden || drag) return;
    stopAuto();
    timer = setInterval(() => goTo(index + 1, { velocity: 0 }), 5000);
  }
  function restartAuto() { stopAuto(); startAuto(); }
  carousel.addEventListener('mouseenter', () => { hovering = true; stopAuto(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; startAuto(); });
  carousel.addEventListener('focusin', () => { hovering = true; stopAuto(); });
  carousel.addEventListener('focusout', () => { hovering = false; startAuto(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stopAuto() : startAuto()));

  new ResizeObserver(() => {
    width = viewport.clientWidth;
    cancelAnimationFrame(raf);
    x = -index * width; v = 0;
    render();
  }).observe(viewport);

  setIndex(0);
  render();
  startAuto();
})();
