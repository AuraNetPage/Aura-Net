/* =========================================================
   AURA NET — script.js (fitur sama, ditambah efek aurora & cahaya kursor)
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
     2. JUDUL — muncul per kata (hero + judul tiap bagian)
     --------------------------------------------------------- */
  function splitWords(el) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text
      .split(/\s+/)
      .map((word, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`)
      .join(' ');
  }

  const title = $('[data-split]');
  if (title) splitWords(title);

  const sectionTitles = $$('.section h2');
  sectionTitles.forEach((h) => { splitWords(h); h.classList.add('reveal-words'); });
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      titleObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  sectionTitles.forEach((h) => titleObserver.observe(h));

  /* ---------------------------------------------------------
     3. NAVIGASI (pil melayang + penanda geser)
     --------------------------------------------------------- */
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  const progress = $('#progress');
  const ind = $('.nav__ind', navLinks);
  const desktopQuery = window.matchMedia('(min-width: 901px)');

  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('nav--hide');
  }

  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  desktopQuery.addEventListener('change', (e) => { if (e.matches) setMenu(false); placeInd(activeLink); });
  nav.addEventListener('focusin', () => nav.classList.remove('nav--hide'));

  // Penanda geser di belakang tautan (desktop)
  const linkMap = new Map($$('[data-link]', navLinks).map((a) => [a.dataset.link, a]));
  let activeLink = null;
  let indReady = false;

  function placeInd(a) {
    if (!ind) return;
    $$('[data-link]', navLinks).forEach((l) => l.classList.toggle('is-lit', desktopQuery.matches && l === a));
    if (!desktopQuery.matches || !a) { ind.style.opacity = '0'; return; }
    if (!indReady) {
      ind.style.transition = 'none';
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
      void ind.offsetWidth;
      ind.style.transition = '';
      indReady = true;
    } else {
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
    }
    ind.style.opacity = '1';
  }

  linkMap.forEach((a) => {
    a.addEventListener('pointerenter', () => { if (finePointer) placeInd(a); });
  });
  navLinks.addEventListener('pointerleave', () => placeInd(activeLink));
  window.addEventListener('resize', () => placeInd(activeLink));

  // Tautan aktif sesuai bagian yang sedang dilihat
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkMap.forEach((a) => a.classList.remove('is-active'));
      activeLink = linkMap.get(entry.target.id) || null;
      activeLink?.classList.add('is-active');
      placeInd(activeLink);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => sectionObserver.observe(s));

  /* ---------------------------------------------------------
     4. SCROLL: indikator, nav, hero, pita berjalan
     --------------------------------------------------------- */
  const heroEl = $('.hero');
  const marquee = $('#marquee');
  const toTop = $('#toTop');
  const toTopRing = $('#toTopRing');
  const RING = 131.95;
  let ticking = false;
  let lastY = window.scrollY;
  let navLockUntil = 0;

  // Pita miring ikut bereaksi pada kecepatan scroll
  let skew = 0, skewLast = window.scrollY, skewRunning = false;
  function skewLoop() {
    const y = window.scrollY;
    const v = y - skewLast;
    skewLast = y;
    skew += (clamp(v * -0.22, -6, 6) - skew) * 0.14;
    marquee.style.setProperty('--skew', skew.toFixed(2) + 'deg');
    if (Math.abs(skew) > 0.03 || Math.abs(v) > 0.2) requestAnimationFrame(skewLoop);
    else { skewRunning = false; marquee.style.setProperty('--skew', '0deg'); }
  }

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 24);
    const ratio = max > 0 ? clamp(y / max, 0, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;

    // nav bersembunyi saat scroll turun, muncul lagi saat scroll naik
    if (performance.now() > navLockUntil && !navLinks.classList.contains('is-open')) {
      const dy = y - lastY;
      if (y > 520 && dy > 6) nav.classList.add('nav--hide');
      else if (dy < -6 || y <= 520) nav.classList.remove('nav--hide');
    }
    lastY = y;

    if (heroEl && y < heroEl.offsetHeight) {
      heroEl.style.setProperty('--sy', y.toFixed(1));
      heroEl.style.setProperty('--fade', clamp(1 - y / (heroEl.offsetHeight * 0.8), 0, 1).toFixed(3));
    }
    if (toTop) {
      toTop.classList.toggle('show', y > 500);
      toTopRing.style.strokeDashoffset = (RING * (1 - ratio)).toFixed(2);
    }
    if (marquee && !reduceMotion && !skewRunning) { skewRunning = true; skewLast = y; requestAnimationFrame(skewLoop); }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------------------------------------------------
     5. REVEAL SAAT SCROLL + ANGKA BERJALAN + LANGKAH PASANG
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

  // Langkah pasang menyala satu per satu seperti bar sinyal
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-on');
      stepObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
  $$('.step').forEach((el) => stepObserver.observe(el));

  /* ---------------------------------------------------------
     6. HERO: efek parallax mengikuti kursor
     --------------------------------------------------------- */
  const orbit = $('#orbit');
  if (orbit && !reduceMotion && finePointer) {
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
     7. KARTU PAKET: efek miring 3D + kilau
     --------------------------------------------------------- */
  const card = $('#priceCard');
  if (card && !reduceMotion && finePointer) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(y * -9).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
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
  const mapNodes = $$('.node');
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (areaList) {
    areaList.innerHTML = CONFIG.areas.map((name, i) => `<li style="--i:${i}">${name}</li>`).join('');
  }

  const clearMatches = () => {
    $$('li', areaList).forEach((li) => li.classList.remove('is-match'));
    mapNodes.forEach((n) => n.classList.remove('is-hit'));
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
          const node = mapNodes[items.indexOf(li) % (mapNodes.length || 1)];
          node?.classList.add('is-hit');
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
     11. FORMULIR PENDAFTARAN -> WhatsApp
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
     12. TRANSISI PINDAH BAGIAN (bar sinyal) + KEMBALI KE ATAS
     --------------------------------------------------------- */
  const wipe = $('#wipe');
  let wiping = false;

  function jumpTo(target) {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = '';
  }

  function goTo(hash) {
    const target = hash === '#top' ? document.body : $(hash);
    if (!target) return;
    if (reduceMotion || !wipe) {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (wiping) return;
    wiping = true;
    wipe.classList.add('is-in');

    setTimeout(() => {
      navLockUntil = performance.now() + 600;
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
      }, 760);
    }, 760);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    setMenu(false);
    goTo(hash);
  });

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------------------------------------------------
     13. KURSOR CINCIN + TOMBOL MAGNETIK (perangkat dengan mouse)
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
    $$('.btn--lg, .nav__cta, .btn--submit, .phone-box__actions .btn').forEach((btn) => {
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
     13b. EFEK BARU: aurora mengikuti kursor + cahaya di kartu
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    const rootEl = document.documentElement;
    window.addEventListener('pointermove', (e) => {
      rootEl.style.setProperty('--px', (e.clientX / window.innerWidth - 0.5).toFixed(3));
      rootEl.style.setProperty('--py', (e.clientY / window.innerHeight - 0.5).toFixed(3));
    }, { passive: true });
    $$('.feature').forEach((f) => {
      f.addEventListener('pointermove', (e) => {
        const r = f.getBoundingClientRect();
        f.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        f.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------------------------------------------------
     14. TAHUN DI FOOTER
     --------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
