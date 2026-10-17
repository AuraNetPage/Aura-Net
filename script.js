/* =========================================================
   AURA NET — script.js
   ========================================================= */

/* ---------------------------------------------------------
   PENGATURAN — edit bagian ini sesuai kebutuhan Anda
   --------------------------------------------------------- */
const CONFIG = {
  // Daftar wilayah yang sudah terjangkau (ganti dengan nama asli)
  areas: [
    'Desa Contoh A',
    'Desa Contoh B',
    'Kelurahan Contoh C',
    'Perumahan Contoh D',
    'Dusun Contoh E',
    'Kecamatan Contoh F'
  ],
  phoneDisplay: '0895 6300 94597',
  whatsappNumber: '62895630094597',
  packageLabel: '10 Mbps, Rp150.000/bulan'
};

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const body = document.body;
  const loader = $('#loader');

  /* ---------------------------------------------------------
     1. LOADING AWAL (logo membangun diri, tulisan tumbuh, bar, tirai naik)
     --------------------------------------------------------- */
  const MIN_LOADING = reduceMotion ? 0 : 3900; // durasi minimum animasi (ms)
  const startedAt = performance.now();
  const pctEl = $('#loaderPct');
  let finished = false;

  function pctLoop() {
    if (finished || !pctEl) return;
    const t = clamp((performance.now() - startedAt) / 3600, 0, 1);
    pctEl.textContent = Math.min(99, Math.floor((1 - Math.pow(1 - t, 3)) * 100));
    requestAnimationFrame(pctLoop);
  }
  if (!reduceMotion) pctLoop();

  function finishLoading() {
    if (finished) return;
    finished = true;
    if (pctEl) pctEl.textContent = '100';
    if (loader) loader.classList.add('is-done');
    body.classList.remove('is-loading');
    window.scrollTo(0, 0);
    setTimeout(() => {
      body.classList.add('is-ready');
      $('.fab')?.classList.add('show');
      setTimeout(() => $$('.hero [data-count]').forEach(countUp), reduceMotion ? 0 : 1200);
    }, reduceMotion ? 0 : 500);
    setTimeout(() => loader && loader.remove(), 1600);
  }

  function scheduleFinish() {
    const wait = Math.max(0, MIN_LOADING - (performance.now() - startedAt));
    setTimeout(finishLoading, wait);
  }

  if (document.readyState === 'complete') scheduleFinish();
  else window.addEventListener('load', scheduleFinish);
  setTimeout(finishLoading, 8000); // pengaman jika sumber daya lambat

  /* ---------------------------------------------------------
     2. JUDUL: hero per huruf, judul bagian per kata
     --------------------------------------------------------- */
  const heroTitle = $('#heroTitle');
  if (heroTitle) {
    const lines = $$('.ln', heroTitle);
    heroTitle.setAttribute('aria-label', lines.map((l) => l.textContent.trim()).join(' '));
    lines.forEach((ln, li) => {
      const text = ln.textContent.trim();
      ln.style.setProperty('--l', li);
      ln.setAttribute('aria-hidden', 'true');
      ln.innerHTML = Array.from(text)
        .map((c, i) => (c === ' ' ? ' ' : `<span class="ch" style="--i:${i}">${c}</span>`))
        .join('');
    });
  }

  function splitWords(el) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text
      .split(/\s+/)
      .map((word, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`)
      .join(' ');
  }

  const sectionTitles = $$('.sheet h2');
  sectionTitles.forEach((h) => { splitWords(h); h.classList.add('reveal-words'); });
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      titleObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  sectionTitles.forEach((h) => titleObserver.observe(h));

  /* ---------------------------------------------------------
     3. NAVIGASI + MENU LAYAR PENUH
     --------------------------------------------------------- */
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  const menu = $('#menu');
  const progress = $('#progress');
  const dot = $('.nav__dot', navLinks);
  const desktopQuery = window.matchMedia('(min-width: 901px)');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('nav--hide');
  }
  navToggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  nav.addEventListener('focusin', () => nav.classList.remove('nav--hide'));

  // Titik penanda geser di bawah tautan aktif (desktop)
  const linkMap = new Map($$('[data-link]', navLinks).map((a) => [a.dataset.link, a]));
  let activeLink = null;
  let dotReady = false;

  function placeDot(a) {
    if (!dot) return;
    if (!desktopQuery.matches || !a) { dot.style.opacity = '0'; return; }
    const x = a.offsetLeft + a.offsetWidth / 2 - 3;
    if (!dotReady) {
      dot.style.transition = 'none';
      dot.style.transform = `translateX(${x}px)`;
      void dot.offsetWidth;
      dot.style.transition = '';
      dotReady = true;
    } else {
      dot.style.transform = `translateX(${x}px)`;
    }
    dot.style.opacity = '1';
  }
  desktopQuery.addEventListener('change', (e) => { if (e.matches) setMenu(false); placeDot(activeLink); });
  window.addEventListener('resize', () => placeDot(activeLink));
  linkMap.forEach((a) => a.addEventListener('pointerenter', () => { if (finePointer) placeDot(a); }));
  navLinks.addEventListener('pointerleave', () => placeDot(activeLink));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkMap.forEach((a) => a.classList.remove('is-active'));
      activeLink = linkMap.get(entry.target.id) || null;
      activeLink?.classList.add('is-active');
      placeDot(activeLink);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => sectionObserver.observe(s));

  /* ---------------------------------------------------------
     4. SCROLL: indikator, nav, hero, kartu bertumpuk, garis waktu
     --------------------------------------------------------- */
  const heroEl = $('.hero');
  const toTop = $('#toTop');
  const toTopRing = $('#toTopRing');
  const RING = 131.95;
  const stackEl = $('#stack');
  const cards = $$('.scard');
  const timeline = $('#steps');
  const tlRows = $$('.tl');
  let ticking = false;
  let lastY = window.scrollY;
  let navLockUntil = 0;

  function updateStack() {
    if (!stackEl || cards.length < 2) return;
    const rect = stackEl.getBoundingClientRect();
    if (rect.bottom < -300 || rect.top > window.innerHeight + 300) return;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const top = parseFloat(getComputedStyle(card).top) || 0;
      const nextTop = next.getBoundingClientRect().top;
      const t = clamp(1 - (nextTop - (top + 16)) / (card.offsetHeight + 12), 0, 1);
      card.style.setProperty('--t', t.toFixed(3));
    });
  }

  function updateTimeline() {
    if (!timeline) return;
    const vh = window.innerHeight;
    const r = timeline.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    timeline.style.setProperty('--p', clamp((vh * 0.6 - r.top) / r.height, 0, 1).toFixed(3));
    tlRows.forEach((row) => row.classList.toggle('is-on', row.getBoundingClientRect().top < vh * 0.62));
  }

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 24);
    const ratio = max > 0 ? clamp(y / max, 0, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;

    // nav bersembunyi saat scroll turun, muncul lagi saat scroll naik
    if (performance.now() > navLockUntil && !menu.classList.contains('is-open')) {
      const dy = y - lastY;
      if (y > 520 && dy > 6) nav.classList.add('nav--hide');
      else if (dy < -6 || y <= 520) nav.classList.remove('nav--hide');
    }
    lastY = y;

    if (heroEl && y < heroEl.offsetHeight) {
      heroEl.style.setProperty('--sy', y.toFixed(1));
      heroEl.style.setProperty('--fade', clamp(1 - y / (heroEl.offsetHeight * 0.75), 0, 1).toFixed(3));
    }
    if (toTop) {
      toTop.classList.toggle('show', y > 500);
      toTopRing.style.strokeDashoffset = (RING * (1 - ratio)).toFixed(2);
    }
    updateStack();
    updateTimeline();
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------------------------------------------------
     5. REVEAL SAAT SCROLL + ANGKA BERJALAN
     --------------------------------------------------------- */
  const formatID = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n));

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (!target || reduceMotion) return;
    const duration = 1800;
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp((now - t0) / duration, 0, 1);
      el.textContent = formatID(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      if (entry.target.matches('[data-count]')) countUp(entry.target);
      $$('[data-count]', entry.target).forEach(countUp);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));

  // kartu keunggulan & area: tandai saat terlihat (memicu animasi isi)
  const viewObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      viewObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  $$('.scard, .area__copy').forEach((el) => viewObserver.observe(el));

  /* ---------------------------------------------------------
     6. HERO: gelombang sinyal (kanvas) + riak mengikuti kursor
     --------------------------------------------------------- */
  (function initSignal() {
    const canvas = $('#heroCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, ox = 0, oy = 0, maxR = 0;
    let running = false, visible = true, lastSpawn = { x: -999, y: -999 };
    const ripples = [];

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = w < 760;
      ox = w * (narrow ? 0.5 : 0.76);
      oy = h * (narrow ? 0.62 : 0.46);
      maxR = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const base = Math.min(w, h);
      // cincin diam
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(ox, oy, i * base * 0.17, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.075 - i * 0.01})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // cincin sinyal yang merambat keluar
      const N = 5;
      for (let k = 0; k < N; k++) {
        const phase = ((t / 9000) + k / N) % 1;
        const r = phase * maxR;
        const a = Math.pow(1 - phase, 1.8) * 0.55;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,165,134,${a.toFixed(3)})`;
        ctx.lineWidth = 1 + (1 - phase) * 2.4;
        ctx.stroke();
      }
      // sumber sinyal
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 90);
      g.addColorStop(0, 'rgba(255,165,134,.42)');
      g.addColorStop(1, 'rgba(255,165,134,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox, oy, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
      // riak dari kursor / sentuhan
      for (let i = ripples.length - 1; i >= 0; i--) {
        const p = ripples[i];
        const age = (t - p.born) / 1700;
        if (age >= 1) { ripples.splice(i, 1); continue; }
        const e = 1 - Math.pow(1 - age, 3);
        [1, 0.62].forEach((m, j) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, e * p.size * m, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${((1 - age) * (j ? 0.25 : 0.5)).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }

    function frame(t) {
      draw(t);
      if (visible && !reduceMotion) requestAnimationFrame(frame);
      else running = false;
    }
    function start() {
      if (running || reduceMotion) return;
      running = true;
      requestAnimationFrame(frame);
    }

    function spawn(e, size2) {
      const r = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, born: performance.now(), size: size2 });
      if (ripples.length > 14) ripples.shift();
      start();
    }

    size();
    draw(2000);
    window.addEventListener('resize', () => { size(); draw(performance.now()); });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(heroEl);
    start();

    if (!reduceMotion) {
      heroEl.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        if (Math.hypot(e.clientX - lastSpawn.x, e.clientY - lastSpawn.y) < 80) return;
        lastSpawn = { x: e.clientX, y: e.clientY };
        spawn(e, 170);
      }, { passive: true });
      heroEl.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a, button')) return;
        spawn(e, 320);
      });
    }
  })();

  /* ---------------------------------------------------------
     7. PITA BERJALAN: bergerak sendiri, bereaksi pada scroll
     --------------------------------------------------------- */
  (function initBand() {
    const band = $('#band');
    if (!band || reduceMotion) return;
    const rows = $$('.band__row', band).map((el) => ({ el, dir: Number(el.dataset.dir) || -1, x: 0, w: 0 }));
    let visible = true, lastScroll = window.scrollY, boost = 0, sign = 1;

    function measure() {
      rows.forEach((r) => {
        const first = r.w === 0;
        r.w = r.el.scrollWidth / 2;
        r.x = first ? -r.w / 2 : ((r.x % r.w) - r.w) % r.w;
      });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(band);

    (function tick() {
      if (visible) {
        const y = window.scrollY;
        const v = y - lastScroll;
        lastScroll = y;
        boost += (clamp(v, -50, 50) - boost) * 0.08;
        if (Math.abs(boost) > 0.6) sign += ((boost > 0 ? 1 : -1) - sign) * 0.1;
        const speed = 0.9 + Math.abs(boost) * 0.5;
        rows.forEach((r) => {
          r.x += r.dir * speed * sign;
          if (r.x <= -r.w) r.x += r.w;
          if (r.x > 0) r.x -= r.w;
          r.el.style.transform = `translate3d(${r.x.toFixed(1)}px,0,0)`;
        });
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------------------------------------------------------
     8. KARTU PAKET: miring 3D + sorot cahaya mengikuti kursor
     --------------------------------------------------------- */
  const card = $('#priceCard');
  if (card && !reduceMotion && finePointer) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(y * -7).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  document.addEventListener('pointermove', (e) => {
    const g = e.target.closest ? e.target.closest('.glow') : null;
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
    g.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
  }, { passive: true });

  /* ---------------------------------------------------------
     9. AREA LAYANAN: daftar wilayah + pengecekan + radar
     --------------------------------------------------------- */
  const areaList = $('#areaList');
  const checker = $('#checker');
  const areaInput = $('#areaInput');
  const result = $('#checkerResult');
  const blips = $$('.blip');
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (areaList) {
    areaList.innerHTML = CONFIG.areas.map((name, i) => `<li style="--i:${i}">${name}</li>`).join('');
  }

  const clearMatches = () => {
    $$('li', areaList).forEach((li) => li.classList.remove('is-match'));
    blips.forEach((b) => b.classList.remove('is-hit'));
  };

  function showResult(type, html) {
    result.className = `checker__result ${type}`;
    result.innerHTML = html;
    requestAnimationFrame(() => requestAnimationFrame(() => result.classList.add('show')));
  }

  if (checker) {
    checker.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = normalize(areaInput.value);
      clearMatches();

      if (query.length < 3) {
        showResult('no', 'Ketik minimal 3 huruf nama desa, kelurahan, atau perumahan Anda.');
        return;
      }

      const items = $$('li', areaList);
      const matches = items.filter((li) => {
        const name = normalize(li.textContent);
        return name.includes(query) || query.includes(name);
      });

      if (matches.length) {
        matches.forEach((li) => {
          li.classList.add('is-match');
          blips[items.indexOf(li) % (blips.length || 1)]?.classList.add('is-hit');
        });
        showResult('ok', `Kabar baik, area ${matches[0].textContent} sudah terjangkau Aura Net.`);
      } else {
        const msg = encodeURIComponent(`Halo Aura Net, saya ingin mengecek apakah area ${areaInput.value.trim()} sudah terjangkau.`);
        showResult('no', `Area belum ada di daftar. <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${msg}" target="_blank" rel="noopener">Tanyakan lewat WhatsApp</a>, kami cek langsung.`);
      }
    });

    areaInput.addEventListener('input', () => {
      if (!areaInput.value) {
        result.classList.remove('show');
        clearMatches();
      }
    });
  }

  /* ---------------------------------------------------------
     10. FAQ (akordeon)
     --------------------------------------------------------- */
  $$('.faq__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const willOpen = !item.classList.contains('is-open');
      $$('.faq__item').forEach((it) => {
        it.classList.remove('is-open');
        $('.faq__q', it).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------
     11. SALIN NOMOR + TOAST
     --------------------------------------------------------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  $('#copyBtn')?.addEventListener('click', async () => {
    const number = CONFIG.phoneDisplay.replace(/\s/g, '');
    try {
      await navigator.clipboard.writeText(number);
    } catch (err) {
      const tmp = document.createElement('textarea');
      tmp.value = number;
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
    }
    showToast('Nomor disalin: ' + number);
  });

  /* ---------------------------------------------------------
     12. FORMULIR PENDAFTARAN -> WhatsApp
     --------------------------------------------------------- */
  const form = $('#registerForm');
  if (form) {
    const nameEl = $('#regName');
    const addrEl = $('#regAddress');
    const errName = $('#errName');
    const errAddr = $('#errAddress');
    const submitBtn = $('.btn--submit', form);
    const label = $('.btn__label', submitBtn);

    const setError = (input, box, msg) => {
      box.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    nameEl.addEventListener('input', () => setError(nameEl, errName, ''));
    addrEl.addEventListener('input', () => setError(addrEl, errAddr, ''));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameEl.value.trim();
      const address = addrEl.value.trim();
      let valid = true;

      if (name.length < 3) {
        setError(nameEl, errName, 'Isi nama lengkap Anda (minimal 3 huruf).');
        valid = false;
      }
      if (address.length < 10) {
        setError(addrEl, errAddr, 'Isi alamat dengan jelas: nama jalan, desa atau kelurahan, dan patokan.');
        valid = false;
      }
      if (!valid) {
        (name.length < 3 ? nameEl : addrEl).focus();
        return;
      }

      const message = [
        'Halo Aura Net, saya ingin mendaftar pemasangan internet.',
        '',
        `Nama: ${name}`,
        `Alamat pemasangan: ${address}`,
        `Paket: ${CONFIG.packageLabel}`,
        '',
        'Mohon info jadwal survei lokasi. Terima kasih.'
      ].join('\n');
      const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

      const original = label.textContent;
      submitBtn.disabled = true;
      submitBtn.classList.add('is-sending');
      label.textContent = 'Membuka WhatsApp...';
      showToast('Membuka WhatsApp dengan data pendaftaran Anda');

      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-sending');
        label.textContent = original;
      }, 2600);
    });
  }

  /* ---------------------------------------------------------
     13. TRANSISI PINDAH BAGIAN (iris melingkar) + KEMBALI KE ATAS
     --------------------------------------------------------- */
  const wipe = $('#wipe');
  let wiping = false;

  function jumpTo(target) {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = '';
  }

  function goTo(hash, x, y) {
    const target = hash === '#top' ? document.body : $(hash);
    if (!target) return;
    if (reduceMotion || !wipe) {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (wiping) return;
    wiping = true;
    wipe.style.setProperty('--x', `${x}px`);
    wipe.style.setProperty('--y', `${y}px`);
    wipe.classList.add('is-in');

    setTimeout(() => {
      navLockUntil = performance.now() + 700;
      jumpTo(target);
      nav.classList.remove('nav--hide');
      lastY = window.scrollY;
      if (hash !== '#top') history.replaceState(null, '', hash);
      wipe.classList.add('is-out');

      setTimeout(() => {
        wipe.classList.add('no-anim');
        wipe.classList.remove('is-in', 'is-out');
        void wipe.offsetWidth;
        wipe.classList.remove('no-anim');
        wiping = false;
      }, 880);
    }, 950);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    setMenu(false);
    const r = link.getBoundingClientRect();
    const x = e.detail ? e.clientX : r.left + r.width / 2;
    const y = e.detail ? e.clientY : r.top + r.height / 2;
    goTo(hash, x, y);
  });

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------------------------------------------------
     14. KURSOR CINCIN + TOMBOL MAGNETIK (perangkat dengan mouse)
     --------------------------------------------------------- */
  const spot = $('#spotlight');
  if (spot && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      spot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) { running = false; return; }
      requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      spot.style.opacity = '1';
      spot.classList.toggle('is-hover', !!e.target.closest('a, button, input, textarea, .faq__q, .chips li'));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { spot.style.opacity = '0'; });
  }

  if (finePointer && !reduceMotion) {
    $$('.btn--lg, .nav__cta, .phone-box__actions .btn').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.translate = `${(x * 0.16).toFixed(1)}px ${(y * 0.28).toFixed(1)}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  }

  /* ---------------------------------------------------------
     15. TAHUN DI FOOTER
     --------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
