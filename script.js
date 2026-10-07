(() => {
  document.documentElement.classList.add('js-ready');
  const menu = document.querySelector('.menu');
  const mobileNav = document.querySelector('.mobile-nav');
  const modes = document.querySelectorAll('.mode');
  const startScreen = document.querySelector('.start-screen');
  const startOutput = document.querySelector('.start-output');
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const openMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
    mobileNav.classList.toggle('open', open);
  };
  menu.addEventListener('click', () => openMenu(menu.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => openMenu(false)));

  root.dataset.mode = 'light';
  const updateMode = () => {
    const green = root.dataset.mode === 'green';
    modes.forEach((mode) => {
      mode.setAttribute('aria-pressed', String(green));
      mode.innerHTML = `MODE: <b>${green ? 'GREEN' : 'LIGHT'}</b>`;
    });
  };
  updateMode();
  modes.forEach((mode) => mode.addEventListener('click', () => {
    root.dataset.mode = root.dataset.mode === 'green' ? 'light' : 'green';
    localStorage.setItem('jg-mode', root.dataset.mode);
    updateMode();
  }));

  const slides = [...document.querySelectorAll('.life-slide')];
  const dots = [...document.querySelectorAll('.life-dots button')];
  let activeSlide = 0;
  let rotationTimer;
  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeSlide;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  };
  const carousel = document.querySelector('.life-carousel');
  const rotate = () => showSlide(activeSlide + 1);
  const startRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = window.setInterval(rotate, 5000);
  };
  const manualSlide = (index) => {
    showSlide(index);
    startRotation();
  };
  document.querySelector('.life-prev')?.addEventListener('click', () => manualSlide(activeSlide - 1));
  document.querySelector('.life-next')?.addEventListener('click', () => manualSlide(activeSlide + 1));
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => manualSlide(dotIndex)));
  carousel?.addEventListener('mouseenter', () => window.clearInterval(rotationTimer));
  carousel?.addEventListener('mouseleave', startRotation);
  carousel?.addEventListener('focusin', () => window.clearInterval(rotationTimer));
  carousel?.addEventListener('focusout', startRotation);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(rotationTimer);
    else startRotation();
  });
  startRotation();

  const bootLines = [
    'INITIALIZING FIELDNET KERNEL ............ OK',
    'LOADING UAV & ROBOTICS SYSTEMS INDEX .... OK',
    'MOUNTING ROBOTICS / AUTONOMY ARCHIVE .... OK',
    'VERIFYING OPERATOR PROFILE .............. OK',
    'ESTABLISHING LOCAL CONSOLE .............. READY'
  ];
  let lineIndex = 0;
  const printLine = () => {
    if (lineIndex < bootLines.length) {
      const line = document.createElement('p');
      line.textContent = bootLines[lineIndex++];
      startOutput.append(line);
      window.setTimeout(printLine, reduced ? 45 : 190);
    } else {
      window.setTimeout(() => {
        startScreen.classList.add('is-complete');
        document.body.classList.remove('is-booting');
        startScreen.setAttribute('aria-hidden', 'true');
      }, reduced ? 120 : 700);
    }
  };
  document.body.classList.add('is-booting');
  window.setTimeout(printLine, reduced ? 30 : 260);

  if (reduced || typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }
})();
