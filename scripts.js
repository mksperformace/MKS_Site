/* ============================================================
   MKS PERFORMANCE — script.js
   ============================================================ */

/* ---- PARTICLE CANVAS ---- */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = window.innerWidth < 768 ? 55 : 110;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(a, b) { return Math.random() * (b - a) + a; }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = rand(0, W);
      this.y  = initial ? rand(0, H) : H + 5;
      this.r  = rand(0.5, 1.8);
      this.vx = rand(-0.15, 0.15);
      this.vy = rand(-0.4, -0.1);
      this.alpha = rand(0.1, 0.55);
      // colour: mix of blue and purple
      const hue = rand(230, 270);
      this.colour = `hsla(${hue}, 80%, 65%, ${this.alpha})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -5) this.reset(false);
      if (this.x < -5) this.x = W + 5;
      if (this.x > W + 5) this.x = -5;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.colour;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  /* Draw connecting lines between nearby particles */
  function drawConnections() {
    const DIST = 90;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - d / DIST) * 0.08;
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ---- HEADER SCROLL ---- */
(function () {
  const header = document.getElementById('header');
  function update() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ---- MOBILE MENU ---- */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn) {
      btn.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();


/* ---- SCROLL-TRIGGERED FADE IN ---- */
(function () {
  const targets = document.querySelectorAll(
    '.card, .result-card, .testi-card, .about__stat-block, .about__text, .about__visual, .hero__metrics, .contact__info, .contact__form'
  );

  targets.forEach(el => el.classList.add('fade-in-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling cards
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ---- COUNTER ANIMATION ---- */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const ease = 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
})();


/* ---- FORM SUBMIT ---- */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mensagem enviada!';
    btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Solicitar diagnóstico gratuito';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
})();


/* ---- HERO TITLE STAGGER ---- */
(function () {
  const lines = document.querySelectorAll('.title-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(20px)';
    line.style.transition = `opacity 0.7s ease ${i * 0.15 + 0.3}s, transform 0.7s ease ${i * 0.15 + 0.3}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      });
    });
  });

  // Sub elements
  const subs = ['.hero__eyebrow', '.hero__sub', '.hero__actions', '.hero__metrics'];
  subs.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.12 + 0.7}s, transform 0.6s ease ${i * 0.12 + 0.7}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();