(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const OPEN = reduce ? 900 : 2300; /* harus sama dengan --t di CSS */
  const WA = '62895630094597';
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const hero = $('.hero'), head = $('.site'), fab = $('.fab'), menuBtn = $('.menu-btn');

  /* opening: kunci scroll, hitung 0-100%, lalu buka tirai */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  document.body.classList.add('lock');
  const pct = $('#pct'), tp = performance.now();
  (function load(now) {
    const k = Math.min((now - tp) / (OPEN - 700), 1);
    pct.textContent = Math.round(100 * (1 - Math.pow(1 - k, 2)));
    if (k < 1) requestAnimationFrame(load);
  })(tp);
  setTimeout(() => { document.body.classList.remove('lock'); $('.intro').remove(); }, OPEN + 800);

  /* progres scroll, header, tombol chat, parallax orb */
  const prog = document.createElement('div');
  prog.className = 'prog';
  document.body.append(prog);
  const onScroll = () => {
    const y = scrollY;
    head.classList.toggle('scrolled', y > 40);
    fab.classList.toggle('show', y > innerHeight * 0.8);
    prog.style.setProperty('--p', (y / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
    if (y < innerHeight * 1.6) hero.style.setProperty('--py', y);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu mobile */
  const setMenu = open => {
    head.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  /* transisi perpindahan: layar berwarna menyapu, halaman pindah di balik layar */
  const pages = {
    beranda: ['Beranda', '#1A1260', '#fff'], keunggulan: ['Keunggulan', '#7A4BFF', '#fff'],
    paket: ['Paket', '#B23AA8', '#fff'], area: ['Area layanan', '#3B38FF', '#fff'],
    'cara-pasang': ['Cara pasang', '#FF5FA8', '#1A1260'], faq: ['Tanya jawab', '#FFD166', '#1A1260'],
    daftar: ['Daftar', '#FF8A5C', '#1A1260']
  };
  const wipe = document.createElement('div'), wl = document.createElement('span');
  wipe.className = 'wipe'; wipe.setAttribute('aria-hidden', 'true'); wipe.append(wl);
  document.body.append(wipe);
  let busy = false;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1), t = id && id !== 'main' && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    const [label, bg, fg] = pages[id] || [id, '#3B38FF', '#fff'];
    wipe.style.setProperty('--c', bg); wipe.style.setProperty('--tc', fg); wl.textContent = label;
    wipe.className = 'wipe in';
    setTimeout(() => {
      scrollTo({ top: id === 'beranda' ? 0 : t.getBoundingClientRect().top + scrollY, behavior: 'instant' });
      history.replaceState(null, '', '#' + id);
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
      onScroll();
      wipe.className = 'wipe out';
    }, 850);
    setTimeout(() => { wipe.className = 'wipe'; busy = false; }, 1550);
  });

  /* meter: hitung naik setelah tirai pembuka */
  const meter = $('.meter'), count = $('#count');
  meter.classList.add('go');
  {
    count.textContent = '0';
    const t0 = performance.now() + OPEN + 500;
    (function tick(now) {
      const k = Math.min(Math.max((now - t0) / 1800, 0), 1);
      count.textContent = Math.round(10 * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* riak air berwarna di hero */
  const cv = $('#water'), ctx = cv.getContext('2d');
  const pal = [[255, 95, 168], [255, 209, 102], [121, 199, 255]];
  let w = 0, h = 0, ripples = [], running = false, last = 0, timer = OPEN + 200, lx = -999, ly = -999;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const center = () => {
    const m = $('.dial').getBoundingClientRect(), r = hero.getBoundingClientRect();
    return [m.left + m.width / 2 - r.left, m.top + m.height / 2 - r.top];
  };
  const drop = (x, y, big) => {
    ripples.push({ x, y, t: 0, c: Math.floor(Math.random() * 3), max: big ? Math.min(w, 520) * 0.8 : 230, n: big ? 3 : 2 });
    if (ripples.length > 14) ripples.shift();
  };
  const ring = (p, i, k) => {
    const e = 1 - Math.pow(1 - k, 3), r = e * p.max, c = pal[((p.c || 0) + i) % 3];
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(1 - k) * 0.7})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const frame = now => {
    if (!running) return;
    const dt = Math.min(now - last, 50);
    last = now;
    ctx.clearRect(0, 0, w, h);
    timer -= dt;
    if (timer <= 0) { const [x, y] = center(); drop(x, y, true); timer = 2800; }
    for (const p of ripples) {
      p.t += dt;
      for (let i = 0; i < p.n; i++) {
        const k = (p.t - i * 280) / 2600;
        if (k > 0 && k < 1) ring(p, i, k);
      }
    }
    ripples = ripples.filter(p => p.t < 2600 + p.n * 280);
    requestAnimationFrame(frame);
  };
  size();
  addEventListener('resize', size);
  {
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    }).observe(hero);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (Math.hypot(x - lx, y - ly) > 80) { lx = x; ly = y; drop(x, y, false); }
    });
    hero.addEventListener('pointerdown', e => {
      const r = hero.getBoundingClientRect();
      drop(e.clientX - r.left, e.clientY - r.top, true);
    });
  }

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
  $$('.hs, .plan, .steps').forEach(el => io.observe(el));

  /* latar halaman berubah warna mengikuti section */
  const bgs = { keunggulan: '#E9E4FF', paket: '#FFE2EE', area: '#DCEFFF', 'cara-pasang': '#FFE8D6', faq: '#FFF3C7' };
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.body.style.backgroundColor = bgs[e.target.id];
  }), { rootMargin: '-50% 0px -50% 0px' });
  Object.keys(bgs).forEach(id => so.observe($('#' + id)));

  /* cahaya yang mengikuti kursor, tombol magnet, kartu paket miring */
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
    const plan = $('.plan');
    plan.addEventListener('pointermove', e => {
      const r = plan.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      plan.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    plan.addEventListener('pointerleave', () => { plan.style.transform = ''; });
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
