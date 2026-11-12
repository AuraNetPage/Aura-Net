(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '62895630094597';
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

  /* header, tombol chat, menu mobile */
  const head = $('.site'), fab = $('.fab'), menuBtn = $('.menu-btn');
  const onScroll = () => {
    head.classList.toggle('scrolled', scrollY > 40);
    fab.classList.toggle('show', scrollY > innerHeight * 0.8);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    head.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  /* meter kecepatan: hitung naik + busur terisi */
  const meter = $('.meter'), count = $('#count');
  if (reduce) {
    meter.classList.add('go');
  } else {
    meter.classList.add('go');
    count.textContent = '0';
    const t0 = performance.now() + 1200;
    (function tick(now) {
      const k = Math.min(Math.max((now - t0) / 1800, 0), 1);
      count.textContent = Math.round(10 * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* riak air di hero: jatuh otomatis dari meter, dan mengikuti sentuhan/kursor */
  const cv = $('#water'), hero = $('.hero'), ctx = cv.getContext('2d');
  let w = 0, h = 0, ripples = [], running = false, last = 0, timer = 0, lx = -999, ly = -999;

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
    ripples.push({ x, y, t: 0, max: big ? Math.min(w, 520) * 0.8 : 230, n: big ? 3 : 2 });
    if (ripples.length > 14) ripples.shift();
  };
  const ring = (p, i, k) => {
    const e = 1 - Math.pow(1 - k, 3), r = e * p.max;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.strokeStyle = i % 2 ? `rgba(157,182,255,${(1 - k) * 0.5})` : `rgba(111,227,210,${(1 - k) * 0.6})`;
    ctx.lineWidth = 1.5;
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
  if (reduce) {
    const [x, y] = center();
    [0.25, 0.5, 0.75].forEach((k, i) => ring({ x, y, max: Math.min(w, 520) * 0.8 }, i, k));
  } else {
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

  /* garis dan kabel menyala saat masuk layar */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  $$('.rows li, .steps').forEach(el => io.observe(el));

  /* kartu paket miring mengikuti kursor */
  const plan = $('.plan');
  if (!reduce && matchMedia('(hover: hover)').matches) {
    plan.addEventListener('pointermove', e => {
      const r = plan.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      plan.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
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

  /* salin nomor & kirim pendaftaran ke WhatsApp */
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
