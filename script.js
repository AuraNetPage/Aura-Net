/* =========================================================
   AURA NET v3 — SCRIPT
   Bagian PENGATURAN di bawah ini yang paling sering Anda ubah.
   ========================================================= */
(() => {
'use strict';

/* ---------- PENGATURAN ---------- */
const CONFIG = {
  phoneDisplay: '0895-6300-94597',
  phoneLocal:   '0895630094597',
  phoneIntl:    '62895630094597'   // format WhatsApp: tanpa 0 di depan, diawali 62
};

/* EDIT: ganti dengan nama desa / kelurahan / perumahan yang benar-benar terjangkau.
   status: 'aktif' = sudah terlayani, 'segera' = rencana perluasan. */
const COVERAGE = [
  { name: 'Perumahan Griya Asri',  status: 'aktif'  },
  { name: 'Desa Sukamaju',         status: 'aktif'  },
  { name: 'Kelurahan Mekarsari',   status: 'aktif'  },
  { name: 'Kampung Harapan',       status: 'aktif'  },
  { name: 'Komplek Bumi Indah',    status: 'aktif'  },
  { name: 'Dusun Sidorejo',        status: 'segera' }
];

/* ---------- Util ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const wa = (text = '') => `https://wa.me/${CONFIG.phoneIntl}` + (text ? `?text=${encodeURIComponent(text)}` : '');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Link WhatsApp dengan pesan otomatis ---------- */
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa); });

/* ---------- Toast ---------- */
const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ---------- Navigasi ---------- */
const nav = $('#nav'), burger = $('#burger'), prog = $('#progress'), fab = $('#fab');
let ticking = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 20);
  const max = html.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
  fab.classList.toggle('show', y > 500);
  journeyUpdate();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });
document.addEventListener('click', e => { if (nav.classList.contains('open') && !e.target.closest('.nav')) setMenu(false); });

if ('IntersectionObserver' in window) {
  const navLinks = $$('.links a[href^="#"], .mnav a[href^="#"]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => {
      const on = a.getAttribute('href') === '#' + e.target.id && !a.classList.contains('btn');
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['paket', 'jangkauan', 'pasang', 'faq'].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
}

/* ---------- Muncul saat scroll + hitungan harga ---------- */
const price = $('#priceNum');
if (price && !reduce) price.textContent = '0';
function countTo(el) {
  const to = +el.dataset.count, dur = 1600, s = performance.now();
  (function f(n) {
    const p = Math.min((n - s) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('id-ID');
    if (p < 1) requestAnimationFrame(f);
  })(s);
}
if ('IntersectionObserver' in window && !reduce) {
  html.classList.add('rv');
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    o.unobserve(e.target);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  if (price) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { countTo(price); o.unobserve(e.target); } }), { threshold: .6 }).observe(price);
}

/* ---------- Cahaya kartu mengikuti kursor ---------- */
if (fine) {
  document.addEventListener('pointermove', e => {
    const t = e.target.closest && e.target.closest('.spot');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
}

/* ---------- Hero: miring halus mengikuti kursor ---------- */
const hero = $('.hero'), heroUi = $('#heroUi');
if (hero && heroUi && fine && !reduce) {
  let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  const step = () => {
    cx += (tx - cx) * .1; cy += (ty - cy) * .1;
    heroUi.style.setProperty('--px', cx.toFixed(3));
    heroUi.style.setProperty('--py', cy.toFixed(3));
    if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) requestAnimationFrame(step);
    else running = false;
  };
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5) * 2;
    ty = ((e.clientY - r.top) / r.height - .5) * 2;
    hero.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    if (!running) { running = true; requestAnimationFrame(step); }
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!running) { running = true; requestAnimationFrame(step); } });
}

/* ---------- Gelombang (canvas) ---------- */
const waves = [];
function makeWave(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = { canvas, ctx, W: 0, H: 0, vis: false };
  const layers = [
    { c: '255,61,129',  amp: .30, f: 1.2, s: 1.0,  p: 0,   fill: .16 },
    { c: '255,122,61',  amp: .24, f: 1.8, s: -1.3, p: 1.6, fill: .12 },
    { c: '255,200,61',  amp: .17, f: 2.5, s: 1.8,  p: 3.1, fill: 0   }
  ];
  w.size = () => {
    const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
    w.W = r.width; w.H = r.height;
    canvas.width = Math.round(w.W * d); canvas.height = Math.round(w.H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  w.draw = now => {
    const t = now / 1000, { W, H } = w;
    ctx.clearRect(0, 0, W, H);
    layers.forEach(L => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const nx = x / W, edge = Math.sqrt(Math.sin(nx * Math.PI));
        const y = H * .55 + Math.sin(nx * Math.PI * 2 * L.f + t * L.s + L.p) * H * L.amp * edge;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(${L.c},.95)`; ctx.stroke();
      if (L.fill) {
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgba(${L.c},${L.fill})`); g.addColorStop(1, `rgba(${L.c},0)`);
        ctx.fillStyle = g; ctx.fill();
      }
    });
  };
  w.size();
  waves.push(w);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { w.vis = e.isIntersecting; })).observe(canvas);
  else w.vis = true;
  if (reduce) w.draw(1500);
}
makeWave($('#waveHero'));
makeWave($('#waveBento'));
addEventListener('resize', () => waves.forEach(w => { w.size(); if (reduce) w.draw(1500); }));

/* ---------- Peta titik (canvas) + daftar area + pengecek ---------- */
let dmFrame = () => {}, dmVis = false;
(function coverage() {
  const dm = $('#dotmap'), cvs = $('#dmCanvas'), pinsEl = $('#dmPins');
  const listEl = $('#areaList'), form = $('#checker'), input = $('#areaInput'), result = $('#areaResult');
  if (!dm || !cvs || !listEl) return;
  const ctx = cvs.getContext('2d');
  const n = COVERAGE.length;
  const AP = [[.2, .3], [.5, .14], [.8, .3], [.85, .66], [.56, .86], [.22, .74], [.36, .5], [.68, .5]];
  const P = COVERAGE.map((a, i) => AP[i] || [.5 + Math.cos(i * 2.4) * .36, .5 + Math.sin(i * 2.4) * .34]);
  let W = 0, H = 0, S = 16, R = 80, dots = [], act = 0;

  const rgb = nx => {
    const t = clamp(nx, 0, 1);
    if (t < .55) { const k = t / .55; return [255, Math.round(61 + 61 * k), Math.round(129 - 68 * k)]; }
    const k = (t - .55) / .45; return [255, Math.round(122 + 78 * k), 61];
  };

  function layout() {
    const d = Math.min(devicePixelRatio || 1, 2), r = dm.getBoundingClientRect();
    W = r.width; H = r.height;
    cvs.width = Math.round(W * d); cvs.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    S = Math.max(13, Math.round(W / 38));
    const cols = Math.floor((W - S) / S) + 1, rows = Math.floor((H - S) / S) + 1;
    const ox = (W - (cols - 1) * S) / 2, oy = (H - (rows - 1) * S) / 2;
    R = Math.min(W, H) * .2;
    dots = [];
    for (let a = 0; a < rows; a++) for (let b = 0; b < cols; b++) {
      const x = ox + b * S, y = oy + a * S;
      let ci = -1, best = 1e9;
      P.forEach((p, i) => { const dd = Math.hypot(x - p[0] * W, y - p[1] * H); if (dd < R && dd < best) { best = dd; ci = i; } });
      dots.push({ x, y, ci, dd: ci >= 0 ? best / R : 1, dh: Math.hypot(x - W / 2, y - H / 2), c: ci >= 0 && COVERAGE[ci].status === 'segera' ? [255, 200, 61] : rgb(x / W) });
    }
  }

  dmFrame = now => {
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    const maxR = Math.hypot(W, H) / 2, rr = ((t * .17) % 1.25) * maxR, band = S * 2.4;
    for (const p of dots) {
      let a = .11, rad = 1.3, c = [255, 255, 255];
      if (p.ci >= 0) {
        const soon = COVERAGE[p.ci].status === 'segera';
        c = p.c; a = (.34 + .5 * (1 - p.dd)) * (soon ? .75 : 1); rad = 1.7 + 1.3 * (1 - p.dd);
        if (p.ci === act) { a = Math.min(1, a + .22 + .14 * Math.sin(t * 3 - p.dd * 5)); rad += .7; }
      }
      const dr = Math.abs(p.dh - rr);
      if (dr < band) { const k = 1 - dr / band; a = Math.min(1, a + .5 * k); rad += k * .9; if (p.ci < 0) c = [255, 170, 120]; }
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832); ctx.fill();
    }
  };

  /* pin HTML (bisa diklik + terbaca pembaca layar) */
  pinsEl.innerHTML = COVERAGE.map((a, i) => {
    const soon = a.status === 'segera';
    return `<button class="dm-pin${soon ? ' soon' : ''}${P[i][1] < .22 ? ' below' : ''}" type="button" data-i="${i}" style="--x:${(P[i][0] * 100).toFixed(1)}%;--y:${(P[i][1] * 100).toFixed(1)}%" aria-label="${esc(a.name)}${soon ? ' (segera)' : ''}"><span class="dm-label">${esc(a.name)}${soon ? ' (segera)' : ''}</span></button>`;
  }).join('');
  listEl.innerHTML = COVERAGE.map((a, i) =>
    `<li><button class="area${a.status === 'segera' ? ' soon' : ''}" type="button" data-i="${i}" aria-pressed="false"><span class="dot"></span><span>${esc(a.name)}</span>${a.status === 'segera' ? '<span class="soon-tag">Segera</span>' : ''}</button></li>`
  ).join('');

  const pins = $$('.dm-pin', pinsEl), areaBtns = $$('.area', listEl);
  function setActive(i) {
    act = i;
    pins.forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    areaBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const b = pins[i];
    if (!b) return;
    const label = $('.dm-label', b);
    label.style.setProperty('--sx', '0px');
    requestAnimationFrame(() => {
      const wr = dm.getBoundingClientRect(), lr = label.getBoundingClientRect();
      let shift = 0;
      if (lr.left < wr.left + 8) shift = wr.left + 8 - lr.left;
      else if (lr.right > wr.right - 8) shift = wr.right - 8 - lr.right;
      label.style.setProperty('--sx', shift.toFixed(1) + 'px');
    });
  }
  areaBtns.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i)));
  pins.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i)));

  layout();
  setActive(0);
  if (reduce) dmFrame(1500);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); setActive(act); if (reduce) dmFrame(1500); }, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setActive(act));
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { dmVis = e.isIntersecting; })).observe(dm);
  else dmVis = true;

  /* pengecek area */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const GENERIC = new Set(['desa', 'kelurahan', 'perumahan', 'komplek', 'kompleks', 'kampung', 'dusun', 'jalan', 'blok', 'kecamatan', 'kota', 'kabupaten']);
  const keyWords = s => norm(s).split(' ').filter(w => w.length >= 4 && !GENERIC.has(w));

  function show(type, text, withLink) {
    result.className = 'result ' + type;
    result.textContent = text;
    if (withLink) {
      const a = document.createElement('a');
      a.href = wa('Halo Aura Net, apakah daerah saya bisa dipasang internet? Alamat saya: ' + input.value.trim());
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Tanya lewat WhatsApp';
      result.append(' ', a);
    }
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = norm(input.value);
    if (q.length < 3) { show('bad', 'Ketik minimal 3 huruf nama desa, kelurahan, atau perumahan Anda.'); return; }
    const qWords = keyWords(input.value);
    const hits = COVERAGE.map((a, i) => ({ a, i })).filter(({ a }) => {
      const nm = norm(a.name);
      return nm.includes(q) || q.includes(nm) || keyWords(a.name).some(w => qWords.includes(w));
    });
    if (hits.length === 0) {
      show('bad', 'Wilayah itu belum ada di daftar kami. Hubungi kami, siapa tahu sudah bisa dipasang.', true);
    } else if (hits.length === 1) {
      const { a, i } = hits[0];
      setActive(i);
      if (a.status === 'segera') show('soon', `${a.name} masuk rencana perluasan. Hubungi kami untuk info terbaru.`);
      else show('ok', `${a.name} termasuk area layanan Aura Net. Hubungi kami untuk jadwal pemasangan.`);
    } else {
      setActive(hits[0].i);
      show('ok', `Ditemukan ${hits.length} wilayah: ${hits.map(h => h.a.name).join(', ')}. Pilih salah satu dari daftar.`);
    }
  });
})();

/* ---------- Satu loop animasi untuk semua canvas ---------- */
if (!reduce) {
  (function loop(now) {
    for (const w of waves) if (w.vis) w.draw(now);
    if (dmVis) dmFrame(now);
    requestAnimationFrame(loop);
  })(performance.now());
}

/* ---------- Cara pasang: jalur perjalanan yang terisi saat scroll ---------- */
const journey = $('#journey'), jsvg = $('#jpath'), jbase = $('#jbase'), jfill = $('#jfill'), jdot = $('#jdot'), jg = $('#jg');
const jlis = $$('#jsteps .jstep');
let jLen = 0, jNodes = [];

function journeyBuild() {
  if (!journey || !jbase) return;
  const jr = journey.getBoundingClientRect();
  const pts = jlis.map(li => {
    const r = $('.jn', li).getBoundingClientRect();
    return { x: r.left - jr.left + r.width / 2, y: r.top - jr.top + r.height / 2 };
  });
  const vertical = pts.every(p => Math.abs(p.x - pts[0].x) < 4);
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (vertical) d += ` L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    else { const dx = (b.x - a.x) * .5; d += ` C${(a.x + dx).toFixed(1)} ${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; }
  }
  jbase.setAttribute('d', d); jfill.setAttribute('d', d);
  jLen = jfill.getTotalLength();
  jfill.style.strokeDasharray = jLen;
  if (vertical) { jg.setAttribute('x1', 0); jg.setAttribute('x2', 0); jg.setAttribute('y1', pts[0].y); jg.setAttribute('y2', pts[pts.length - 1].y); }
  else { jg.setAttribute('x1', pts[0].x); jg.setAttribute('x2', pts[pts.length - 1].x); jg.setAttribute('y1', 0); jg.setAttribute('y2', 0); }
  /* posisi tiap simpul sepanjang jalur */
  jNodes = pts.map(p => {
    let best = 0, bd = 1e9;
    for (let l = 0; l <= jLen; l += 4) { const q = jfill.getPointAtLength(l); const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = l; } }
    return best;
  });
}
function journeyUpdate() {
  if (!journey || !jLen) return;
  const r = journey.getBoundingClientRect();
  const start = innerHeight * .85, travel = innerHeight * .35 + r.height;
  const p = reduce ? 1 : clamp((start - r.top) / travel, 0, 1);
  const L = jLen * p;
  jfill.style.strokeDashoffset = (jLen - L).toFixed(1);
  const pt = jfill.getPointAtLength(L);
  jdot.setAttribute('cx', pt.x.toFixed(1)); jdot.setAttribute('cy', pt.y.toFixed(1));
  jdot.style.opacity = p > 0 && p < 1 ? 1 : 0;
  jlis.forEach((li, i) => li.classList.toggle('on', L >= jNodes[i] - 2 && p > .005 || reduce));
}
journeyBuild();
addEventListener('resize', () => { journeyBuild(); journeyUpdate(); });
addEventListener('load', () => { journeyBuild(); journeyUpdate(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { journeyBuild(); journeyUpdate(); });
onScroll();

/* ---------- FAQ ---------- */
const qas = $$('.qa');
qas.forEach(q => {
  const b = $('button', q);
  b.addEventListener('click', () => {
    const open = q.dataset.open === 'true';
    qas.forEach(o => { o.dataset.open = 'false'; $('button', o).setAttribute('aria-expanded', 'false'); });
    if (!open) { q.dataset.open = 'true'; b.setAttribute('aria-expanded', 'true'); }
  });
});

/* ---------- Kontak: salin nomor + form WhatsApp ---------- */
const copyBtn = $('#copyBtn');
if (copyBtn) copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(CONFIG.phoneLocal);
    toast('Nomor disalin: ' + CONFIG.phoneLocal);
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = CONFIG.phoneLocal; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast('Nomor disalin: ' + CONFIG.phoneLocal); }
    catch (e2) { toast('Salin manual: ' + CONFIG.phoneLocal); }
    ta.remove();
  }
});

const order = $('#order');
if (order) {
  ['nama', 'alamat'].forEach(name => {
    order.elements[name].addEventListener('input', e => e.target.closest('label').classList.remove('invalid'));
  });
  order.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['nama', 'alamat'].forEach(name => {
      const f = order.elements[name];
      const bad = !f.value.trim();
      f.closest('label').classList.toggle('invalid', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;
    const text = 'Halo Aura Net, saya ingin pasang internet.\n\n' +
      'Nama: ' + order.elements.nama.value.trim() + '\n' +
      'Alamat pemasangan: ' + order.elements.alamat.value.trim() + '\n' +
      'Paket: 10 Mbps (Rp150.000/bulan)\n\n' +
      'Mohon info jadwal survei. Terima kasih.';
    window.open(wa(text), '_blank', 'noopener');
    toast('Membuka WhatsApp');
  });
}

/* ---------- Tahun footer ---------- */
const yr = $('#year');
if (yr) yr.textContent = new Date().getFullYear();

})();
