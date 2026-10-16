// =====================================================
// MOTION PREFERENCE
// =====================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =====================================================
// SCROLL REVEAL — fades sections in as you scroll to them
// =====================================================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// =====================================================
// COUNT-UP STATS — numbers animate from 0 to their target
// =====================================================
const counters = document.querySelectorAll('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      let cur = 0;
      const step = Math.max(1, Math.round(target / 30));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target; } else { el.textContent = cur; requestAnimationFrame(tick); }
      };
      tick();
      countIO.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(el => countIO.observe(el));

// =====================================================
// SKILL BAR FILL — progress bars animate to their % on scroll
// =====================================================
const bars = document.querySelectorAll('.bar-fill');
const barIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.getAttribute('data-target') + '%';
      barIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
bars.forEach(el => barIO.observe(el));

// =====================================================
// MARQUEE — duplicates the tech-strip content for a seamless loop
// =====================================================
const marquee = document.getElementById('marquee');
if (marquee) marquee.innerHTML += marquee.innerHTML;

// =====================================================
// TERMINAL BOOT SEQUENCE — types every line out, one after another
// =====================================================
(function terminalBoot() {
  const termBody = document.querySelector('.term-body');
  if (!termBody) return;

  const LAST_LINE = "echo $STATUS -> 'open to work'";
  const typedTarget = document.getElementById('typed-line');

  // capture the original content, then clear the screen
  const rows = Array.from(termBody.querySelectorAll('.row')).map(row => {
    const cmd = row.querySelector('.cmd');
    const outs = Array.from(row.querySelectorAll('.out'));
    return {
      row,
      cmd,
      cmdText: cmd ? cmd.textContent : '',
      outs,
      outHTML: outs.map(o => o.innerHTML)
    };
  });

  if (reduceMotion) {
    if (typedTarget) typedTarget.textContent = LAST_LINE;
    return;
  }

  rows.forEach(r => {
    r.row.style.visibility = 'hidden';
    if (r.cmd) r.cmd.textContent = '';
    r.outs.forEach(o => { o.style.visibility = 'hidden'; });
  });

  const CHAR_MS = 26;      // typing speed for commands
  const OUT_MS = 180;      // pause before each output line appears
  const ROW_MS = 320;      // pause between blocks

  function typeText(el, text, done) {
    let n = 0;
    (function step() {
      el.textContent = text.slice(0, n);
      if (n++ <= text.length) setTimeout(step, CHAR_MS);
      else done();
    })();
  }

  function runRow(index) {
    if (index >= rows.length) return;
    const r = rows[index];
    r.row.style.visibility = 'visible';

    const afterCmd = () => {
      let k = 0;
      (function showOut() {
        if (k >= r.outs.length) { setTimeout(() => runRow(index + 1), ROW_MS); return; }
        const out = r.outs[k];
        out.style.visibility = 'visible';
        // the final line types itself out instead of appearing at once
        if (out.id === 'typed-line') {
          typeText(out, LAST_LINE, () => { k++; showOut(); });
        } else {
          out.innerHTML = r.outHTML[k];
          k++;
          setTimeout(showOut, OUT_MS);
        }
      })();
    };

    if (r.cmd) typeText(r.cmd, r.cmdText, afterCmd); else afterCmd();
  }

  setTimeout(() => runRow(0), 500);
})();

// =====================================================
// HERO ROLE TYPING LOOP — types each role, deletes it, moves to the next
// =====================================================
const roleTarget = document.getElementById('role-type');
const roles = ['AI/ML Engineer', 'Machine Learning', 'Generative AI', 'Computer Vision', 'Deep Learning'];
if (roleTarget) {
  if (reduceMotion) {
    roleTarget.textContent = roles[0];
  } else {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeRole = () => {
      const word = roles[roleIndex];
      charIndex = deleting ? charIndex - 1 : charIndex + 1;
      roleTarget.textContent = word.slice(0, charIndex);

      let delay = deleting ? 45 : 85;

      if (!deleting && charIndex === word.length) {
        delay = 1600;              // hold the finished word
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;               // small pause before the next word
      }
      setTimeout(typeRole, delay);
    };
    setTimeout(typeRole, 600);
  }
}

// =====================================================
// HEADER — turns frosted/blurred once the page is scrolled
// =====================================================
(function frostedHeader() {
  const header = document.querySelector('header.nav');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// =====================================================
// PROJECT FILTER — toggles project cards by category
// =====================================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards = document.querySelectorAll('#proj-grid .proj-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    projCards.forEach(card => {
      card.style.display = (f === 'all' || card.getAttribute('data-cat') === f) ? '' : 'none';
    });
  });
});

// =====================================================
// MOBILE MENU — hamburger opens the nav links on small screens
// =====================================================
(function mobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
})();

// =====================================================
// ACTIVE NAV LINK — highlights whichever section is on screen
// =====================================================
(function scrollSpy() {
  const links = Array.from(document.querySelectorAll('nav.links a[href^="#"]'));
  if (!links.length) return;

  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  };

  const spy = new IntersectionObserver((entries) => {
    // pick the section closest to the top of the viewport that is still visible
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setActive(visible[0].target.id);
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => spy.observe(s));
})();

// =====================================================
// SCREENSHOT LIGHTBOX — click a project image to view it large
// =====================================================
(function lightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!box || !img) return;

  const close = () => { box.hidden = true; document.body.style.overflow = ''; };

  document.querySelectorAll('.proj-thumb img').forEach(thumb => {
    thumb.addEventListener('click', () => {
      img.src = thumb.getAttribute('src');
      img.alt = thumb.getAttribute('alt') || '';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
})();

// =====================================================
// CONTACT FORM — submits without leaving the page
// =====================================================
(function contactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.className = 'form-status';
    status.textContent = 'Sending your message...';

    try {
      const res = await fetch('https://formsubmit.co/ajax/tayyabshahid029021@gmail.com', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === 'true' || data.success === true || res.status === 200)) {
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Thanks! Your message has been sent. I will get back to you shortly.';
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      status.className = 'form-status err';
      status.innerHTML = 'Unable to send message directly. Please email me at <a href="mailto:tayyabshahid029021@gmail.com" style="text-decoration:underline;color:inherit;">tayyabshahid029021@gmail.com</a>';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
})();

// =====================================================
// AMBIENT DOT FIELD — slow drifting dots that react to the cursor
// =====================================================
(function dotField() {
  const canvas = document.getElementById('dot-field');
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let vw = 0, vh = 0, dots = [];
  const mouse = { x: -9999, y: -9999 };
  const RADIUS = 140;   // how close the cursor has to be to push a dot

  function build() {
    const count = Math.round(Math.min(420, Math.max(150, vw / 3.5)));
    dots = [];
    for (let n = 0; n < count; n++) {
      dots.push({
        x: Math.random() * vw,
        y: Math.random() * vh,
        vx: (Math.random() - 0.5) * 0.22,   // slow random drift
        vy: (Math.random() - 0.5) * 0.22,
        px: 0, py: 0,                        // cursor push offset
        r: Math.random() * 1.7 + 0.9,
        a: Math.random() * 0.22 + 0.12
      });
    }
  }

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  function frame() {
    ctx.clearRect(0, 0, vw, vh);

    for (const d of dots) {
      // ambient drift
      d.x += d.vx;
      d.y += d.vy;

      // wrap around the edges
      if (d.x < -12) d.x = vw + 12;
      if (d.x > vw + 12) d.x = -12;
      if (d.y < -12) d.y = vh + 12;
      if (d.y > vh + 12) d.y = -12;

      // cursor push — dots ease away, then settle back
      const dx = (d.x + d.px) - mouse.x;
      const dy = (d.y + d.py) - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS && dist > 0.001) {
        const force = ((RADIUS - dist) / RADIUS) * 1.6;
        d.px += (dx / dist) * force;
        d.py += (dy / dist) * force;
      }
      d.px *= 0.93;
      d.py *= 0.93;

      ctx.beginPath();
      ctx.arc(d.x + d.px, d.y + d.py, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(47,111,176,' + d.a + ')';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  resize();
  frame();
})();
