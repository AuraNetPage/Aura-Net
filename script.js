(() => {
  const html = document.documentElement;
  html.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const WA = '62895630094597';
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const hero = $('.hero'), head = $('.site'), fab = $('.fab'), menuBtn = $('.menu-btn'), nav = $('.nav');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* nomor urut item menu, dipakai animasi muncul berurutan */
  /* sidebar HP: ikon tiap menu dan kepala panel */
  const IC = { keunggulan: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>', paket: '<path d="M4 8h16v10H4zM4 8l2-4h12l2 4M10 13h4"/>', area: '<path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>', 'cara-pasang': '<path d="M14.5 6.5l3 3M5 19l1-4L16 5l3 3L9 18z"/>', faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01"/>', daftar: '<path d="M5 12h14M13 6l6 6-6 6"/>' };
  $$('.nav li a').forEach(a => {
    const k = a.getAttribute('href').slice(1);
    if (IC[k]) a.insertAdjacentHTML('afterbegin', `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`);
  });
  $('.nav ul').insertAdjacentHTML('afterbegin', '<li class="sb-head" aria-hidden="true"><span class="mark"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="16" r="14" opacity=".45"/><circle cx="16" cy="16" r="8.5"/><circle cx="16" cy="16" r="3" fill="currentColor" stroke="none"/></svg></span><b>Aura Net</b><small>Internet stabil, harga tetap</small></li>');
  $$('.nav li').forEach((li, i) => li.style.setProperty('--i', i));

  /* kecepatan: hitung naik begitu hero mulai tampil */
  const meter = $('.meter'), count = $('#count'), aura = $('.scene');
  count.textContent = '0';
  let heroOn = false;
  const startHero = () => {
    if (heroOn) return;
    heroOn = true;
    html.classList.add('go');
    meter.classList.add('go');
    const tc = performance.now() + 400;
    (function tick(now) {
      const k = clamp((now - tc) / 1800);
      count.textContent = Math.round(10 * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  };

  /* LIQUID GLASS: kaca membelokkan isi di belakangnya (refraksi) lewat filter SVG.
     Peta distorsi dibuat dari bentuk elemen: di tepi (bezel) isi tertarik ke dalam, di tengah datar.
     Hanya Chromium yang bisa memakai filter SVG di backdrop-filter; browser lain jatuh ke kaca buram + kilau tepi. */
  let lite = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  let lgr = !lite && !!window.CSS && CSS.supports('backdrop-filter', 'url(#a)') && /Chrome\//.test(navigator.userAgent) && !/CriOS|EdgiOS|FxiOS/.test(navigator.userAgent);
  if (lgr) html.classList.add('lgr'); else if (lite) html.classList.add('lite');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}, kids = []) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    kids.forEach(c => e.append(c));
    return e;
  };
  let defs = null;
  /* peta distorsi: gradien merah (x) dan hijau (y) hanya aktif di tepi (rim), bagian tengah netral #808080 */
  const mapURL = (w, h, R, rim = 3) => {
    w = Math.round(w); h = Math.round(h); R = Math.max(1, Math.min(R, w / 2, h / 2));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>` +
      `<linearGradient id="Y" x1="0" x2="0" y1="3%" y2="97%"><stop offset="0%" stop-color="#0F0"/><stop offset="100%" stop-color="#000"/></linearGradient>` +
      `<linearGradient id="X" x1="2%" x2="98%" y1="0" y2="0"><stop offset="0%" stop-color="#F00"/><stop offset="100%" stop-color="#000"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="#808080"/><g filter="blur(2px)">` +
      `<rect width="${w}" height="${h}" fill="#000080"/>` +
      `<rect width="${w}" height="${h}" fill="url(#Y)" style="mix-blend-mode:screen"/>` +
      `<rect width="${w}" height="${h}" fill="url(#X)" style="mix-blend-mode:screen"/>` +
      `<rect x="${rim}" y="${rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(0, R - rim)}" ry="${Math.max(0, R - rim)}" fill="#808080" filter="blur(3px)"/></g></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
  const CH = [['r', 1, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'],
              ['g', 0.989, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0'],
              ['b', 0.977, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0']];
  const glass = (id, opt) => {
    if (!lgr) return () => {};
    if (!defs) {
      defs = mk('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
      defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      document.body.append(defs);
    }
    const img = mk('feImage', { x: 0, y: 0, preserveAspectRatio: 'none', result: 'i' });
    const base = [
      mk('feFlood', { 'flood-color': 'rgb(128,128,128)', result: 'n' }),
      img,
      mk('feMerge', { result: 'map' }, [mk('feMergeNode', { in: 'n' }), mk('feMergeNode', { in: 'i' })])];
    const one = [mk('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: 0, 'data-k': 1, xChannelSelector: 'R', yChannelSelector: 'G' })];
    const rgb = [...CH.flatMap(([c, k, m]) => [
      mk('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: 0, 'data-k': k, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + c }),
      mk('feColorMatrix', { in: 'd' + c, type: 'matrix', values: m, result: c })]),
      mk('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }),
      mk('feBlend', { in: 'rg', in2: 'b', mode: 'screen' })];
    const fe = mk('filter', { id, x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }, [...base, ...(opt.disp ? rgb : one)]);
    defs.append(fe);
    const dms = [...fe.querySelectorAll('feDisplacementMap')];
    let key = '';
    return (w, h, R) => {
      const k = Math.round(w) + 'x' + Math.round(h) + 'x' + Math.round(R);
      if (k === key || w < 4 || h < 4) return;
      key = k;
      const S = Math.min(opt.max || 1e9, (opt.k || 0.62) * Math.min(w, h));   /* contoh: 174 untuk 420x280 */
      dms.forEach(n => n.setAttribute('scale', (S * (+n.getAttribute('data-k') || 1)).toFixed(1)));
      img.setAttribute('href', mapURL(w, h, R, opt.rim || 3));
      img.setAttribute('width', w.toFixed(1));
      img.setAttribute('height', h.toFixed(1));
    };
  };
  const bind = (id, el, opt) => {
    const upd = glass(id, opt);
    if (!lgr || !el) return;
    const run = () => upd(el.offsetWidth, el.offsetHeight, parseFloat(getComputedStyle(el, '::before').borderTopLeftRadius) || 999);
    new ResizeObserver(run).observe(el);
    run();
  };
  const ul = $('.nav ul');
  bind('lg-bar', ul, { k: 0.62, max: 120 });
  bind('lg-logo', $('.site .logo'), { k: 0.62, disp: 1 });
  bind('lg-btn', menuBtn, { k: 0.62, disp: 1 });

  /* tema kaca mengikuti latar di bawah header: gelap -> kaca terang, terang -> kaca putih dengan teks gelap */
  let darkR = [];
  const cacheDark = () => { darkR = $$('.hero.dark, .sec.dark, .foot.dark').map(e => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }); };
  const theme = () => { const y = scrollY + 36; head.classList.toggle('onlight', !darkR.some(([a, b]) => y >= a && y < b)); };

  /* lensa cair: pil kaca meluncur ke tautan yang disorot kursor atau bagian yang sedang dibaca */
  const links = $$('.nav li a'), navLinks = links;
  const pill = document.createElement('span');
  pill.className = 'pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.prepend(pill);
  const lensUpds = navLinks.map((_, i) => glass('lg-lens-' + i, { k: 0.62, disp: 1 }));
  const fitLens = () => navLinks.forEach((a, i) => lensUpds[i](a.offsetWidth, a.offsetHeight, a.offsetHeight / 2));
  if (lgr) { new ResizeObserver(fitLens).observe(ul); fitLens(); }
  let active = null, hoverEl = null, focusEl = null, shown = false, prevC = null;
  const st = m => Math.abs(m) < 1 ? '.5s' : m > 0 ? '.64s' : '.34s';   /* tepi awal: menyusul bila bergerak maju */
  const en = m => Math.abs(m) < 1 ? '.5s' : m > 0 ? '.34s' : '.64s';   /* tepi akhir: memimpin bila bergerak maju */
  const place = a => {
    navLinks.forEach(l => l.classList.toggle('on', l === a));
    if (!a) { pill.classList.remove('show'); shown = false; prevC = null; return; }
    pill.classList.toggle('top', a.classList.contains('nav-cta'));
    const w = a.offsetWidth, h = a.offsetHeight;
    let x = 0, y = 0;   /* posisi relatif ke .nav; menyusuri rantai induk karena li yang bertransform ikut jadi offsetParent */
    for (let e = a; e && e !== nav; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
    const c = { x: x + w / 2, y: y + h / 2 };
    const mx = prevC ? c.x - prevC.x : 0, my = prevC ? c.y - prevC.y : 0;
    if (!shown) pill.classList.add('snap');
    pill.style.setProperty('--dl', st(mx)); pill.style.setProperty('--dr', en(mx));
    pill.style.setProperty('--dt', st(my)); pill.style.setProperty('--db', en(my));
    pill.style.setProperty('--l', x + 'px'); pill.style.setProperty('--w', w + 'px');
    pill.style.setProperty('--t', y + 'px'); pill.style.setProperty('--h', h + 'px');
    if (lgr) {
      const f = 'blur(1px) url(#lg-lens-' + navLinks.indexOf(a) + ') blur(2px) saturate(1.5) brightness(1.1)';
      pill.style.webkitBackdropFilter = f; pill.style.backdropFilter = f;
    }
    if (!shown) { void pill.offsetWidth; pill.classList.remove('snap'); shown = true; }
    pill.classList.add('show');
    prevC = c;
  };
  const sync = () => place(hoverEl || focusEl || active);
  new ResizeObserver(sync).observe(nav);   /* panel menu berubah ukuran (mis. layar HP berputar atau bilah alamat) -> lensa menyesuaikan */
  /* keluar dari satu tautan dan masuk ke tautan lain terjadi dalam satu frame; tunda sedikit agar lensa meluncur, bukan hilang lalu muncul */
  let raf = 0;
  const syncSoon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); }); };
  navLinks.forEach(a => {
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'touch') return; hoverEl = a; syncSoon(); });
    a.addEventListener('pointerleave', () => { hoverEl = null; syncSoon(); });
    a.addEventListener('focus', () => { focusEl = a; syncSoon(); });
    a.addEventListener('blur', () => { focusEl = null; syncSoon(); });
    a.addEventListener('pointerdown', e => { pill.classList.add('press'); if (e.pointerType === 'touch') { hoverEl = a; syncSoon(); } });
  });
  ['pointerup', 'pointercancel', 'dragend'].forEach(ev => addEventListener(ev, () => pill.classList.remove('press')));
  const spy = tp => {
    let cur = null;
    links.forEach((a, i) => { if (tp[i] <= innerHeight * 0.45) cur = a; });
    if (cur !== active) { active = cur; sync(); }
  };

  /* kabel cara pasang: menyala sesuai posisi scroll */
  const steps = $('.steps'), stepLis = $$('li', steps);
  function updSteps(r) {
    const p = clamp((innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.15));
    steps.style.setProperty('--p', p.toFixed(3));
    stepLis.forEach((li, i) => {
      li.classList.toggle('on', p * 3 >= i - 0.01);
      li.style.setProperty('--f', clamp(p * 3 - i).toFixed(3));
    });
  }

  /* progres scroll, header, tombol chat, parallax titik hero */
  const prog = document.createElement('div');
  prog.className = 'prog';
  document.body.append(prog);
  let tickId = 0;
  const run = () => {
    tickId = 0;
    const y = scrollY;
    const sr = steps.getBoundingClientRect();                       /* semua pembacaan dulu */
    const tp = links.map(a => { const t = document.getElementById(a.getAttribute('href').slice(1)); return t ? t.getBoundingClientRect().top : 1e9; });
    head.classList.toggle('scrolled', y > 40);
    fab.classList.toggle('show', y > innerHeight * 0.8);
    prog.style.setProperty('--p', (y / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
    if (y < innerHeight * 1.6) hero.style.setProperty('--py', y);
    updSteps(sr); spy(tp); theme();
  };
  const onScroll = () => { if (!tickId) tickId = requestAnimationFrame(run); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { cacheDark(); onScroll(); sync(); });
  addEventListener('load', () => { cacheDark(); onScroll(); });
  cacheDark();
  onScroll();

  /* OPENING: logo tergambar di tengah, terbang ke logo menu, lalu cahaya melebar dari situ */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  const intro = $('.intro'), mark = $('.site .mark');
  document.body.classList.add('lock');
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (intro) intro.remove();
    $$('.edge').forEach(e => e.remove());
    html.classList.add('landed');
    startHero();
    document.body.classList.remove('lock');
    sync();
  };

  function land() {
    if (finished) return;
    const b = mark.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2, r0 = b.width / 2;
    const edge = document.createElement('div');
    edge.className = 'edge';
    edge.style.left = cx + 'px';
    edge.style.top = cy + 'px';
    edge.style.width = edge.style.height = r0 * 2 + 'px';
    document.body.append(edge);
    intro.style.setProperty('--x', cx + 'px');
    intro.style.setProperty('--y', cy + 'px');
    intro.style.setProperty('--r', r0 + 'px');
    html.classList.add('landed');   /* logo asli di header muncul tepat di bawah logo terbang */
    intro.classList.add('reveal');
    $('.fly').remove();
    const maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40;
    const D = 1150, t0 = performance.now();
    (function step(now) {
      if (finished) return;
      const k = clamp((now - t0) / D);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const r = r0 + (maxR - r0) * e;
      intro.style.setProperty('--r', r.toFixed(1) + 'px');
      edge.style.width = edge.style.height = (2 * r).toFixed(1) + 'px';
      edge.style.opacity = k < 0.55 ? 1 : Math.max(0, 1 - (k - 0.55) / 0.4);
      if (k > 0.1) startHero();
      if (k < 1) requestAnimationFrame(step); else finish();
    })(t0);
  }

  function flight() {
    if (finished) return;
    const fly = $('.fly'), fi = $('.fly-in');
    const a = fi.getBoundingClientRect(), b = mark.getBoundingClientRect();
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    const s = b.width / a.width;
    intro.classList.add('flying');
    /* satu transform, satu easing: x, y, dan ukuran bergerak serempak sehingga jalurnya lurus */
    const o = { duration: 950, delay: 160, fill: 'forwards', easing: 'cubic-bezier(.65,0,.2,1)' };
    fly.animate([{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: `translate3d(${dx}px,${dy}px,0) scale(${s})` }], o);
    const px = v => { const e = document.createElement('i'); e.style.color = v; document.body.append(e); const r = getComputedStyle(e).color; e.remove(); return r; };
    fi.animate([{ backgroundColor: px('color-mix(in srgb,var(--mint) 0%,transparent)'), color: '#ffffff' }, { backgroundColor: px('var(--mint)'), color: px('var(--deep)') }], o).finished.then(land, land);
  }

  if (reduce || !intro || !mark || !intro.animate) {
    html.classList.add('landed');
    startHero();
    if (intro) { setTimeout(() => intro.classList.add('quick'), 60); setTimeout(finish, 650); } else finish();
  } else {
    const ready = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([Promise.all([wait(1500), ready, fonts]), wait(5000)]).then(flight);
  }
  setTimeout(finish, 9000); /* pengaman: apa pun yang terjadi, layar pembuka selalu hilang */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);

  /* menu mobile: panel membuka sebagai lingkaran dari tombol menu */
  let readyT = 0;
  const setMenu = open => {
    if (open) {
      const r = menuBtn.getBoundingClientRect();
      nav.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
      nav.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    }
    head.classList.toggle('open', open);
    clearTimeout(readyT);
    if (open) readyT = setTimeout(() => { head.classList.add('ready'); sync(); }, 780); else { head.classList.remove('ready'); hoverEl = null; }
    document.body.classList.toggle('lock', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    requestAnimationFrame(sync);
  };
  menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setTimeout(() => setMenu(false), matchMedia('(max-width:899px)').matches ? 200 : 0)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  /* pindah bagian: luncur halus lewat rAF (tanpa blur layar penuh yang berat) */
  let gl = 0;
  const glide = (getTo, done) => {
    cancelAnimationFrame(gl);
    const maxY = () => document.documentElement.scrollHeight - innerHeight;
    const from = scrollY, dist0 = Math.min(getTo(), maxY()) - from;
    if (reduce || Math.abs(dist0) < 4) { scrollTo({ top: Math.min(getTo(), maxY()), behavior: 'instant' }); done && done(); return; }
    const D = clamp(Math.abs(dist0) / 2.4, 420, 800), t0 = performance.now();
    html.classList.add('gliding');
    const stop = () => { cancelAnimationFrame(gl); html.classList.remove('gliding'); removeEventListener('touchstart', stop); };
    addEventListener('touchstart', stop, { passive: true });
    (function step(now) {
      const k = clamp((now - t0) / D);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const to = Math.min(getTo(), maxY());
      scrollTo({ top: from + (to - from) * e, behavior: 'instant' });
      if (k < 1) gl = requestAnimationFrame(step); else { stop(); done && done(); }
    })(t0);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1), t = id && id !== 'main' && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const go = () => glide(() => id === 'beranda' ? 0 : t.getBoundingClientRect().top + scrollY, () => {
      history.replaceState(null, '', '#' + id);
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    });
    head.classList.contains('open') ? setTimeout(go, 220) : go();
  });

  if (hover) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    aura.style.setProperty('--ax', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    aura.style.setProperty('--ay', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });

  /* judul section muncul kata per kata */
  $$('.sec h2').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map((t, i) => `<span class="w"><span style="--d:${i}">${t}</span></span>`).join(' ');
    el.classList.add('hs');
  });

  /* animasi masuk saat di-scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  const reveal = (sel, cls = '') => $$(sel).forEach(el => {
    el.classList.add('rv', ...cls.split(' ').filter(Boolean));
    el.style.setProperty('--d', [...el.parentElement.children].indexOf(el) % 6);
    io.observe(el);
  });
  reveal('.sub, .stick p, #paket .split>div>p, #area .split>div>p, .note');
  reveal('.uses li', 'l');
  reveal('.rows li, .faq-item, .foot-grid>div');
  reveal('.map, .reg, .check, .chips', 'z');
  reveal('.join .split>div>*');
  $$('.hs, .ticket').forEach(el => io.observe(el));

  /* warna latar halaman berubah mengikuti section */
  const bgs = { keunggulan: 'var(--c60)', paket: 'color-mix(in srgb,var(--c10) 7%,var(--c60))', area: 'color-mix(in srgb,var(--c30) 9%,var(--c60))', 'cara-pasang': 'color-mix(in srgb,var(--c10) 4%,var(--c60))', faq: 'color-mix(in srgb,var(--c30) 5%,var(--c60))' };
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.body.style.backgroundColor = bgs[e.target.id];
  }), { rootMargin: '-50% 0px -50% 0px' });
  Object.keys(bgs).forEach(id => so.observe($('#' + id)));

  /* cahaya kursor, tombol magnet, tiket miring */
  if (hover) {
    const g = document.createElement('div');
    g.className = 'glow';
    document.body.append(g);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, gr = 0;
    const loop = () => {
      gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
      g.style.transform = `translate3d(${(gx - 200).toFixed(1)}px,${(gy - 200).toFixed(1)}px,0)`;
      gr = Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!gr) gr = requestAnimationFrame(loop); }, { passive: true });
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * 0.22 + 'px');
        b.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * 0.3 + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
    });
    const tk = $('.ticket');
    tk.addEventListener('pointermove', e => {
      const r = tk.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tk.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    tk.addEventListener('pointerleave', () => { tk.style.transform = ''; });
  }

  /* cek area layanan */
  const areas = ['Parit Masigi 1', 'Jalan Kemuning'];
  const input = $('#areaInput'), msg = $('#areaMsg'), nodes = $$('.node');
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const say = (cls, text, linkText, href) => {
    msg.className = 'msg';
    void msg.offsetWidth;
    msg.className = 'msg ' + cls;
    msg.replaceChildren(document.createTextNode(text + ' '));
    if (href) {
      const a = document.createElement('a');
      a.textContent = linkText; a.href = href;
      if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      msg.append(a);
    }
  };
  const check = q => {
    const n = norm(q);
    nodes.forEach(g => g.classList.remove('on', 'dim'));
    if (!n) return say('no', 'Ketik nama desa, kelurahan, atau perumahan Anda dulu.');
    const hit = n.length > 2 && areas.find(a => { const m = norm(a); return m.includes(n) || n.includes(m); });
    if (hit) {
      nodes.forEach(g => g.classList.add(g.dataset.area === hit ? 'on' : 'dim'));
      say('ok', `${hit} sudah terjangkau Aura Net.`, 'Daftar sekarang', '#daftar');
    } else {
      say('no', `“${q.trim()}” belum ada di daftar kami.`, 'Tanya lewat WhatsApp',
        wa(`Halo Aura Net, apakah ${q.trim()} sudah terjangkau?`));
    }
  };
  $('#areaForm').addEventListener('submit', e => { e.preventDefault(); check(input.value); });
  $$('.chips button').forEach(b => b.addEventListener('click', () => {
    input.value = b.dataset.area; check(b.dataset.area);
  }));

  /* tanya jawab */
  $$('.faq-q').forEach(b => b.addEventListener('click', () => {
    const item = b.parentElement, open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open);
  }));

  /* salin nomor dan kirim pendaftaran ke WhatsApp */
  const copy = $('#copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('0895630094597'); copy.textContent = 'Nomor tersalin'; }
    catch { copy.textContent = '0895 6300 94597'; }
    setTimeout(() => { copy.textContent = 'Salin nomor'; }, 2200);
  });
  /* bila perangkat terasa berat (banyak frame lambat), matikan filter SVG dan efek mahal secara otomatis */
  const goLite = () => {
    lite = true; lgr = false;
    html.classList.remove('lgr'); html.classList.add('lite');
    pill.style.webkitBackdropFilter = pill.style.backdropFilter = '';
  };
  let bad = 0, nf = 0, lastT = 0, mon = 0;
  const watch = now => {
    if (lastT) { const dt = now - lastT; if (dt > 34 && dt < 500) bad++; nf++; }
    lastT = now;
    if (nf >= 45) { if (bad / nf > 0.3 && !lite) goLite(); bad = nf = 0; }
    if (!lite && mon++ < 600) requestAnimationFrame(watch);
  };
  if (!lite) requestAnimationFrame(watch);

  $('#regForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    open(wa(`Halo Aura Net, saya ingin memasang internet.\nNama: ${f.get('nama')}\nAlamat: ${f.get('alamat')}\nPaket: 10 Mbps, Rp150.000/bulan`), '_blank', 'noopener');
  });
})();
