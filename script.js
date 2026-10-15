/* =========================================================
   AURA NET — script.js
   ========================================================= */

/* ---------------------------------------------------------
   PENGATURAN — edit bagian ini sesuai kebutuhan Anda
   --------------------------------------------------------- */
const CONFIG = {
  // Daftar wilayah yang sudah terjangkau (ganti dengan nama asli)
  areas: [
    'Parit Masigi 1',
    'Jalan Kemuning',
  ],
  phoneDisplay: '0895 6300 94597',
  whatsappNumber: '62895630094597'
};

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const loader = $('#loader');

  /* ---------------------------------------------------------
     1. LOADING AWAL
     --------------------------------------------------------- */
  const MIN_LOADING = reduceMotion ? 0 : 3900; // durasi minimum animasi (ms)
  const startedAt = performance.now();
  let finished = false;

  function finishLoading() {
    if (finished) return;
    finished = true;
    if (loader) loader.classList.add('is-done');
    body.classList.remove('is-loading');
    window.scrollTo(0, 0);
    setTimeout(() => {
      body.classList.add('is-ready');
      $('.fab')?.classList.add('show');
    }, reduceMotion ? 0 : 450);
    setTimeout(() => loader && loader.remove(), 1500);
  }

  function scheduleFinish() {
    const wait = Math.max(0, MIN_LOADING - (performance.now() - startedAt));
    setTimeout(finishLoading, wait);
  }

  if (document.readyState === 'complete') scheduleFinish();
  else window.addEventListener('load', scheduleFinish);
  setTimeout(finishLoading, 8000); // pengaman jika sumber daya lambat

  /* ---------------------------------------------------------
     2. JUDUL HERO — muncul per kata
     --------------------------------------------------------- */
  const title = $('[data-split]');
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.innerHTML = text
      .split(/\s+/)
      .map((word, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`)
      .join(' ');
  }

  /* ---------------------------------------------------------
     3. NAVIGASI
     --------------------------------------------------------- */
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  const progress = $('#progress');

  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Tautan aktif sesuai bagian yang sedang dilihat
  const linkMap = new Map($$('[data-link]').map((a) => [a.dataset.link, a]));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkMap.forEach((a) => a.classList.remove('is-active'));
      linkMap.get(entry.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => sectionObserver.observe(s));

  /* ---------------------------------------------------------
     4. SCROLL: indikator, nav, garis langkah
     --------------------------------------------------------- */
  const steps = $('#steps');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 24);
    progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;

    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.72 - r.top) / (r.height * 0.9), 0, 1);
      steps.style.setProperty('--p', p.toFixed(3));
    }
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
    const duration = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp((now - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = formatID(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      $$('[data-count]', entry.target).forEach(countUp);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------
     6. HERO: efek parallax mengikuti kursor
     --------------------------------------------------------- */
  const orbit = $('#orbit');
  if (orbit && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const layers = $$('[data-depth]', orbit);
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach((el) => {
        const d = Number(el.dataset.depth);
        el.style.transform = `translate3d(${x * d * -1.6}px, ${y * d * -1.6}px, 0)`;
      });
    });
    hero.addEventListener('pointerleave', () => layers.forEach((el) => { el.style.transform = ''; }));
    layers.forEach((el) => { el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)'; });
  }

  /* ---------------------------------------------------------
     7. KARTU PAKET: efek miring 3D
     --------------------------------------------------------- */
  const card = $('#priceCard');
  if (card && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(y * -9).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------------------------------------------------------
     8. AREA LAYANAN: daftar wilayah + pengecekan
     --------------------------------------------------------- */
  const areaList = $('#areaList');
  const checker = $('#checker');
  const areaInput = $('#areaInput');
  const result = $('#checkerResult');
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (areaList) {
    areaList.innerHTML = CONFIG.areas.map((name) => `<li>${name}</li>`).join('');
  }

  function showResult(type, html) {
    result.className = `checker__result ${type}`;
    result.innerHTML = html;
    requestAnimationFrame(() => result.classList.add('show'));
  }

  if (checker) {
    checker.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = normalize(areaInput.value);
      $$('li', areaList).forEach((li) => li.classList.remove('is-match'));

      if (query.length < 3) {
        showResult('no', 'Ketik minimal 3 huruf nama desa, kelurahan, atau perumahan Anda.');
        return;
      }

      const matches = $$('li', areaList).filter((li) => {
        const name = normalize(li.textContent);
        return name.includes(query) || query.includes(name);
      });

      if (matches.length) {
        matches.forEach((li) => li.classList.add('is-match'));
        showResult('ok', `Kabar baik, area ${matches[0].textContent} sudah terjangkau Aura Net.`);
      } else {
        const msg = encodeURIComponent(`Halo Aura Net, saya ingin mengecek apakah area ${areaInput.value.trim()} sudah terjangkau.`);
        showResult('no', `Area belum ada di daftar. <a href="https://wa.me/${CONFIG.whatsappNumber}?text=${msg}" target="_blank" rel="noopener">Tanyakan lewat WhatsApp</a>, kami cek langsung.`);
      }
    });

    areaInput.addEventListener('input', () => {
      if (!areaInput.value) {
        result.classList.remove('show');
        $$('li', areaList).forEach((li) => li.classList.remove('is-match'));
      }
    });
  }

  /* ---------------------------------------------------------
     9. FAQ (akordeon)
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
     10. SALIN NOMOR + TOAST
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
     11. TAHUN DI FOOTER
     --------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
