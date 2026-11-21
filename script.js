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
  const lgr = !!window.CSS && CSS.supports('backdrop-filter', 'url(#a)') && /Chrome\//.test(navigator.userAgent) && !/CriOS|EdgiOS|FxiOS/.test(navigator.userAgent);
  if (lgr) html.classList.add('lgr');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}, kids = []) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    kids.forEach(c => e.append(c));
    return e;
  };
  let defs = null;
  const mapURL = (w, h, R, bezel, magnify) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    const g = c.getContext('2d'), img = g.createImageData(c.width, c.height), d = img.data;
    R = Math.min(R, w / 2, h / 2);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const dx = x + 0.5 - w / 2, dy = y + 0.5 - h / 2;
      const qx = Math.abs(dx) - (w / 2 - R), qy = Math.abs(dy) - (h / 2 - R);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), out = Math.hypot(ox, oy);
      const depth = R - out - Math.min(Math.max(qx, qy), 0);   /* jarak dari tepi ke dalam */
      let nx, ny;                                              /* normal keluar */
      if (out > 0) { nx = Math.sign(dx) * ox / out; ny = Math.sign(dy) * oy / out; }
      else if (qx > qy) { nx = Math.sign(dx); ny = 0; } else { nx = 0; ny = Math.sign(dy); }
      const mag = depth < bezel ? Math.pow(1 - depth / bezel, 2.4) : 0;
      const vx = Math.max(-1, Math.min(1, -nx * mag - (dx / (w / 2)) * magnify));
      const vy = Math.max(-1, Math.min(1, -ny * mag - (dy / (h / 2)) * magnify));
      const o = (y * c.width + x) * 4;
      d[o] = 128 + vx * 127; d[o + 1] = 128 + vy * 127; d[o + 2] = 128; d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  };
  const CH = [['r', 1, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'],
              ['g', 0.9, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0'],
              ['b', 0.8, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0']];
  const glass = (id, opt) => {
    if (!lgr) return () => {};
    if (!defs) {
      defs = mk('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
      defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      document.body.append(defs);
    }
    const img = mk('feImage', { x: 0, y: 0, preserveAspectRatio: 'none', result: 'i' });
    defs.append(mk('filter', { id, x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }, [
      mk('feFlood', { 'flood-color': 'rgb(128,128,128)', result: 'n' }),
      img,
      mk('feMerge', { result: 'map' }, [mk('feMergeNode', { in: 'n' }), mk('feMergeNode', { in: 'i' })]),
      ...CH.flatMap(([c, k, m]) => [
        mk('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: (opt.scale * k).toFixed(1), xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + c }),
        mk('feColorMatrix', { in: 'd' + c, type: 'matrix', values: m, result: c })]),
      mk('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }),
      mk('feBlend', { in: 'rg', in2: 'b', mode: 'screen' })
    ]));
    let key = '';
    return (w, h, R) => {
      const k = Math.round(w) + 'x' + Math.round(h) + 'x' + Math.round(R);
      if (k === key || w < 4 || h < 4) return;
      key = k;
      img.setAttribute('href', mapURL(w, h, R, opt.bezel, opt.magnify || 0));
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
  bind('lg-bar', ul, { bezel: 18, scale: 30 });
  bind('lg-logo', $('.site .logo'), { bezel: 16, scale: 26 });
  bind('lg-btn', menuBtn, { bezel: 12, scale: 22 });

  /* tema kaca mengikuti latar di bawah header: gelap -> kaca terang, terang -> kaca putih dengan teks gelap */
  const theme = () => {
    const under = document.elementsFromPoint(innerWidth / 2, 36).find(e => !head.contains(e));
    head.classList.toggle('onlight', !(under && under.closest('.dark')));
  };

  /* lensa cair: pil kaca meluncur ke tautan yang disorot kursor atau bagian yang sedang dibaca */
  const links = $$('.nav a'), navLinks = $$('.nav a:not(.nav-cta)');
  const pill = document.createElement('span');
  pill.className = 'pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.prepend(pill);
  const lensUpds = navLinks.map((_, i) => glass('lg-lens-' + i, { bezel: 14, scale: 30, magnify: 0.1 }));
  const fitLens = () => navLinks.forEach((a, i) => lensUpds[i](a.offsetWidth, a.offsetHeight, a.offsetHeight / 2));
  if (lgr) { new ResizeObserver(fitLens).observe(ul); fitLens(); }
  let active = null, hoverEl = null, focusEl = null, shown = false, prevC = null;
  const st = m => Math.abs(m) < 1 ? '.5s' : m > 0 ? '.64s' : '.34s';   /* tepi awal: menyusul bila bergerak maju */
  const en = m => Math.abs(m) < 1 ? '.5s' : m > 0 ? '.34s' : '.64s';   /* tepi akhir: memimpin bila bergerak maju */
  const place = a => {
    navLinks.forEach(l => l.classList.toggle('on', l === a));
    if (!a) { pill.classList.remove('show'); shown = false; prevC = null; return; }
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
      const f = 'url(#lg-lens-' + navLinks.indexOf(a) + ') blur(.4px) saturate(2) brightness(1.15)';
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
    a.addEventListener('pointerdown', () => pill.classList.add('press'));
  });
  ['pointerup', 'pointercancel', 'dragend'].forEach(ev => addEventListener(ev, () => pill.classList.remove('press')));
  const spy = () => {
    let cur = null;
    links.forEach(a => {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (t && t.getBoundingClientRect().top <= innerHeight * 0.45) cur = a;
    });
    if (cur && cur.classList.contains('nav-cta')) cur = null;
    if (cur !== active) { active = cur; sync(); }
  };

  /* kabel cara pasang: menyala sesuai posisi scroll */
  const steps = $('.steps'), stepLis = $$('li', steps);
  function updSteps() {
    const r = steps.getBoundingClientRect();
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
  const onScroll = () => {
    const y = scrollY;
    head.classList.toggle('scrolled', y > 40);
    fab.classList.toggle('show', y > innerHeight * 0.8);
    prog.style.setProperty('--p', (y / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
    if (y < innerHeight * 1.6) hero.style.setProperty('--py', y);
    updSteps();
    spy();
    theme();
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { onScroll(); sync(); });
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
    const o = { duration: 1000, delay: 180, fill: 'forwards' };
    fly.animate(
      [{ transform: 'translateX(0px)' }, { transform: `translateX(${dx}px)` }],
      { ...o, easing: 'cubic-bezier(.7,0,.25,1)' });
    fi.animate([
      { transform: 'translateY(0px) scale(1)', backgroundColor: 'rgba(207,245,231,0)', color: '#ffffff', filter: 'drop-shadow(0 0 18px rgba(47,209,197,.6))' },
      { transform: `translateY(${dy}px) scale(${s})`, backgroundColor: 'rgb(207,245,231)', color: 'rgb(5,46,54)', filter: 'drop-shadow(0 0 0px rgba(47,209,197,0))' }
    ], { ...o, easing: 'cubic-bezier(.4,0,.15,1)' }).finished.then(land, land);
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
  const setMenu = open => {
    if (open) {
      const r = menuBtn.getBoundingClientRect();
      nav.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
      nav.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    }
    head.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    requestAnimationFrame(sync);
  };
  menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  /* transisi pindah bagian: layar memburam sebentar, halaman pindah di baliknya, lalu jernih lagi */
  const veil = document.createElement('div');
  veil.className = 'veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.append(veil);
  let busy = false;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1), t = id && id !== 'main' && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    veil.classList.add('on');
    setTimeout(() => {
      scrollTo({ top: id === 'beranda' ? 0 : t.getBoundingClientRect().top + scrollY, behavior: 'instant' });
      history.replaceState(null, '', '#' + id);
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
      onScroll();
    }, reduce ? 120 : 400);
    setTimeout(() => veil.classList.remove('on'), reduce ? 200 : 520);
    setTimeout(() => { busy = false; }, reduce ? 500 : 1150);
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
  const bgs = { keunggulan: '#EAF8F3', paket: '#FFF0CC', area: '#D6F2EF', 'cara-pasang': '#FFE6D4', faq: '#E4F6EC' };
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.body.style.backgroundColor = bgs[e.target.id];
  }), { rootMargin: '-50% 0px -50% 0px' });
  Object.keys(bgs).forEach(id => so.observe($('#' + id)));

  /* cahaya kursor, tombol magnet, tiket miring */
  if (hover) {
    const g = document.createElement('div');
    g.className = 'glow';
    document.body.append(g);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      g.style.transform = `translate(${gx - 200}px,${gy - 200}px)`;
      requestAnimationFrame(loop);
    })();
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
  $('#regForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    open(wa(`Halo Aura Net, saya ingin memasang internet.\nNama: ${f.get('nama')}\nAlamat: ${f.get('alamat')}\nPaket: 10 Mbps, Rp150.000/bulan`), '_blank', 'noopener');
  });
})();
