/* =========================================================
   AURA NET — SCRIPT
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
  { name: 'Parit Masigi 1',  status: 'aktif'  },
  { name: 'Jalan Kemuning',        status: 'segera' }
];

/* ---------- Util ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const wa = (text = '') => `https://wa.me/${CONFIG.phoneIntl}` + (text ? `?text=${encodeURIComponent(text)}` : '');

html.classList.add('hx');

/* ---------- Pecah kata judul hero (animasi masuk) ---------- */
const h1 = $('.hero h1');
if (h1) {
  const words = h1.textContent.trim().split(/\s+/);
  h1.setAttribute('aria-label', words.join(' '));
  h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
}

/* ---------- Tick dial gauge ---------- */
const ticks = $('#ticks');
if (ticks) {
  let s = '';
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (135 + i * 270 / (n - 1)) * Math.PI / 180;
    const r1 = 90, r2 = i % 3 === 0 ? 97 : 94;
    s += `<line x1="${(100 + Math.cos(a) * r1).toFixed(2)}" y1="${(100 + Math.sin(a) * r1).toFixed(2)}" x2="${(100 + Math.cos(a) * r2).toFixed(2)}" y2="${(100 + Math.sin(a) * r2).toFixed(2)}"/>`;
  }
  ticks.innerHTML = s;
}

/* ---------- Loader -> hero tampil ---------- */
const gaugeNum = $('#gaugeNum');
function countUp() {
  if (!gaugeNum || reduce) return;
  const start = performance.now() + 1000, dur = 1900;
  (function tick(now) {
    const p = Math.min(Math.max((now - start) / dur, 0), 1);
    gaugeNum.textContent = Math.round(10 * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
}
if (gaugeNum && !reduce) gaugeNum.textContent = '0';

let started = false;
function ready() {
  if (started) return;
  started = true;
  html.classList.add('ready');
  countUp();
  setTimeout(() => { const l = $('#loader'); if (l) l.remove(); }, 1300);
}
const t0 = performance.now();
const loaded = new Promise(res => document.readyState === 'complete' ? res() : addEventListener('load', res));
const fontsOk = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.all([loaded, fontsOk]).then(() => {
  const wait = reduce ? 0 : Math.max(0, 1200 - (performance.now() - t0));
  setTimeout(ready, wait);
});
setTimeout(ready, 3500);

/* ---------- Link WhatsApp dengan pesan otomatis ---------- */
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa); });

/* ---------- Toast ---------- */
const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ---------- Navigasi: scroll, progress, menu mobile ---------- */
const nav = $('#nav'), prog = $('#progress'), fab = $('#fab'), burger = $('#burger');
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 24);
  const max = html.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  fab.classList.toggle('show', y > 500);
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('.links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });

/* Tandai menu aktif sesuai bagian yang sedang dilihat */
if ('IntersectionObserver' in window) {
  const linkMap = new Map($$('.links a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    linkMap.forEach(a => a.removeAttribute('aria-current'));
    const a = linkMap.get(e.target.id);
    if (a && !a.classList.contains('btn')) a.setAttribute('aria-current', 'true');
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['paket', 'jangkauan', 'pasang', 'faq', 'kontak'].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });
}

/* ---------- Reveal saat scroll ---------- */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && !reduce) {
  html.classList.add('rv');
  const rio = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(el => rio.observe(el));
}

/* ---------- Hero: spotlight kursor + jaringan partikel ---------- */
const hero = $('.hero');
const mouse = { x: -999, y: -999 };
if (hero && fine && !reduce) {
  let raf;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      hero.style.setProperty('--mx', mouse.x + 'px');
      hero.style.setProperty('--my', mouse.y + 'px');
    });
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
}

(function network() {
  const c = $('#net');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0, pts = [], raf = 0, running = false;

  function size() {
    const d = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect();
    w = r.width; h = r.height;
    c.width = Math.round(w * d); c.height = Math.round(h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.max(18, Math.min(64, Math.round(w * h / 18000)));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .32, vy: (Math.random() - .5) * .32,
      r: Math.random() * 1.5 + .6
    }));
  }
  function draw(move) {
    ctx.clearRect(0, 0, w, h);
    const L = 125;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (move) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < L * L) {
          ctx.strokeStyle = `rgba(124,108,255,${(1 - Math.sqrt(d2) / L) * .35})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 170) {
        ctx.strokeStyle = `rgba(77,240,210,${(1 - md / 170) * .6})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(77,240,210,.75)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
  }
  function loop() { draw(true); raf = requestAnimationFrame(loop); }

  size();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (!running) draw(false); }, 150); });

  if (reduce || !('IntersectionObserver' in window)) { draw(false); return; }
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !running) { running = true; loop(); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  })).observe(c);
})();

/* ---------- Kartu paket: efek miring 3D ---------- */
const pkg = $('#pkg');
if (pkg && fine && !reduce) {
  pkg.addEventListener('pointermove', e => {
    const r = pkg.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    pkg.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
    pkg.style.setProperty('--gx', (px + .5) * 100 + '%');
    pkg.style.setProperty('--gy', (py + .5) * 100 + '%');
  });
  pkg.addEventListener('pointerleave', () => { pkg.style.transform = ''; });
}

/* ---------- Jangkauan: peta ilustrasi + pengecek area ---------- */
(function coverage() {
  const mapEl = $('#map'), listEl = $('#areaList'), form = $('#checker'), input = $('#areaInput'), result = $('#areaResult');
  if (!mapEl || !listEl) return;

  const W = 480, H = 420, cx = 240, cy = 210, n = COVERAGE.length;
  const pos = COVERAGE.map((a, i) => {
    const ang = (-90 + i * 360 / n + (i % 2 ? 14 : -10)) * Math.PI / 180;
    const rx = i % 2 ? 170 : 118, ry = i % 2 ? 150 : 102;
    return { x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry };
  });
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const links = pos.map((p, i) => `<line class="m-link ${COVERAGE[i].status === 'segera' ? 'soon' : ''}" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`).join('');
  const nodes = pos.map((p, i) => `<g class="m-node ${COVERAGE[i].status === 'segera' ? 'soon' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(COVERAGE[i].name)}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><circle class="m-halo" r="13"/><circle class="m-core" r="6"/></g>`).join('');

  mapEl.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Peta ilustrasi jangkauan Aura Net">
    <defs>
      <pattern id="mgrid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="rgba(255,255,255,.045)"/></pattern>
      <radialGradient id="mglow"><stop offset="0" stop-color="#4DF0D2" stop-opacity=".3"/><stop offset=".6" stop-color="#7C6CFF" stop-opacity=".1"/><stop offset="1" stop-color="#7C6CFF" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#mgrid)"/>
    <g class="m-roads">
      <path d="M-10 330 C 90 290, 150 360, 250 320 S 420 280, 490 310"/>
      <path d="M120 -10 C 150 90, 90 160, 130 260 S 170 380, 150 430"/>
      <path d="M-10 120 C 100 150, 200 90, 300 130 S 430 170, 490 120"/>
      <path d="M360 -10 C 330 80, 400 150, 370 250 S 330 380, 380 430"/>
    </g>
    <circle class="m-aura" cx="${cx}" cy="${cy}" r="200" fill="url(#mglow)"/>
    <g>${links}</g>
    <g transform="translate(${cx} ${cy})">
      <circle class="m-hub-ring" r="14" style="animation-delay:0s"/>
      <circle class="m-hub-ring" r="14" style="animation-delay:1.2s"/>
      <circle class="m-hub-ring" r="14" style="animation-delay:2.4s"/>
      <circle r="12" fill="url(#ag)"/>
      <circle r="4.5" fill="#070B1F"/>
      <text class="m-hubtxt" y="34">Aura Net</text>
    </g>
    ${nodes}
    <g class="m-label" id="mLabel" style="transform:translate(-999px,-999px)"><rect height="30" rx="15"/><text x="14" y="20"></text></g>
  </svg>`;

  listEl.innerHTML = COVERAGE.map((a, i) =>
    `<li><button class="area ${a.status === 'segera' ? 'soon' : ''}" type="button" data-i="${i}" aria-pressed="false"><span class="dot"></span><span>${esc(a.name)}</span>${a.status === 'segera' ? '<span class="soon-tag">Segera</span>' : ''}</button></li>`
  ).join('');

  const lbl = $('#mLabel', mapEl), lblText = $('text', lbl), lblRect = $('rect', lbl);
  const nodeEls = $$('.m-node', mapEl), areaBtns = $$('.area', listEl);
  let active = -1;

  function setActive(i) {
    active = i;
    nodeEls.forEach(g => g.classList.toggle('on', +g.dataset.i === i));
    areaBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    if (i < 0) return;
    const a = COVERAGE[i], p = pos[i];
    lblText.textContent = a.name + (a.status === 'segera' ? ' (segera)' : '');
    const wTxt = lblText.getComputedTextLength() || lblText.textContent.length * 7.6;
    const w = Math.ceil(wTxt) + 28;
    lblRect.setAttribute('width', w);
    const x = Math.min(Math.max(p.x - w / 2, 8), W - 8 - w);
    let y = p.y - 48; if (y < 8) y = p.y + 24;
    lbl.style.transform = `translate(${x}px,${y}px)`;
  }

  areaBtns.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i)));
  nodeEls.forEach(g => {
    g.addEventListener('click', () => setActive(+g.dataset.i));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(+g.dataset.i); } });
  });
  setActive(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setActive(active));

  /* Pengecek area */
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

/* ---------- Cara pasang: garis progres ---------- */
const stepEls = $$('#steps li');
if ('IntersectionObserver' in window && !reduce) {
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); sio.unobserve(e.target); }
  }), { rootMargin: '0px 0px -20% 0px', threshold: .2 });
  stepEls.forEach(li => sio.observe(li));
} else {
  stepEls.forEach(li => li.classList.add('on'));
}

/* ---------- FAQ accordion ---------- */
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
