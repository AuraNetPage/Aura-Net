(() => {
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const OPEN = reduce ? 1400 : 2400; /* harus sama dengan --t di CSS */
  const WA = '62895630094597';
  const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const hero = $('.hero'), head = $('.site'), fab = $('.fab'), menuBtn = $('.menu-btn');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* opening: kunci scroll, hitung 0-100% saat bola terisi, lalu cincin meledak */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  document.body.classList.add('lock');
  const pct = $('#pct'), tp = performance.now() + 200, dur = Math.max(400, OPEN - 1000);
  (function load(now) {
    const k = clamp((now - tp) / dur);
    pct.textContent = Math.round(100 * (1 - Math.pow(1 - k, 2)));
    if (k < 1) requestAnimationFrame(load);
  })(performance.now());
  setTimeout(() => { document.body.classList.remove('lock'); $('.intro').remove(); }, OPEN + 700);

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
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
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

  /* transisi pindah bagian: kolom warna naik berurutan, halaman pindah di baliknya */
  const names = { beranda: 'Beranda', keunggulan: 'Keunggulan', paket: 'Paket', area: 'Area layanan', 'cara-pasang': 'Cara pasang', faq: 'Tanya jawab', daftar: 'Daftar' };
  const tr = document.createElement('div');
  tr.className = 'tr'; tr.setAttribute('aria-hidden', 'true');
  tr.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><b></b>';
  document.body.append(tr);
  $$('i', tr).forEach((el, k) => el.style.setProperty('--k', k));
  const lab = $('b', tr);
  let busy = false;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1), t = id && id !== 'main' && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    lab.textContent = names[id] || id;
    tr.className = 'tr on';
    void tr.offsetWidth;
    tr.className = 'tr on in';
    setTimeout(() => {
      scrollTo({ top: id === 'beranda' ? 0 : t.getBoundingClientRect().top + scrollY, behavior: 'instant' });
      history.replaceState(null, '', '#' + id);
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
      onScroll();
      tr.className = 'tr on out';
    }, 850);
    setTimeout(() => { tr.className = 'tr'; busy = false; }, 1650);
  });

  /* kecepatan: hitung naik setelah opening, geser halus mengikuti kursor */
  const meter = $('.meter'), count = $('#count'), aura = $('.scene');
  meter.classList.add('go');
  count.textContent = '0';
  const tc = performance.now() + OPEN + 400;
  (function tick(now) {
    const k = clamp((now - tc) / 1800);
    count.textContent = Math.round(10 * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick);
  })(performance.now());
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
