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
  phoneIntl:    '62895630094597',   // format WhatsApp: tanpa 0 di depan, diawali 62
  loaderMinMs:  2500,              // lama minimum loading awal (milidetik)
  loaderOncePerSession: false      // true = loading hanya tampil sekali per kunjungan
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

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ---------- Pecah kata: judul hero + judul bagian ---------- */
const h1 = $('#h1');
if (h1) {
  const words = h1.textContent.trim().split(/\s+/);
  h1.setAttribute('aria-label', words.join(' '));
  h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${esc(w)}</span>`).join(' ');
}
const wrEls = $$('.wr');
wrEls.forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.innerHTML = words.map(w => `<span class="wd" aria-hidden="true">${esc(w)}</span>`).join(' ');
  el._w = $$('.wd', el);
});

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

/* ---------- Sirkuit di hero ---------- */
const CIRCUITS = {
  d: { vb: [1000, 440], chip: { x: 440, y: 200, s: 120 }, fs: [46, 15], ns: 64,
    nodes: [['phone', 130, 166], ['laptop', 98, 298], ['tablet', 355, 392], ['tv', 870, 166], ['game', 902, 298], ['home', 645, 392]],
    traces: ['M440 228H380L318 166H162', 'M440 260H300L262 298H130', 'M440 292H395L355 332V360',
             'M560 228H620L682 166H838', 'M560 260H700L738 298H870', 'M560 292H605L645 332V360',
             'M480 320V440', 'M500 320V440', 'M520 320V440'] },
  m: { vb: [360, 420], chip: { x: 138, y: 168, s: 84 }, fs: [34, 12], ns: 52,
    nodes: [['phone', 56, 62], ['laptop', 56, 210], ['tablet', 84, 350], ['tv', 304, 62], ['game', 304, 210], ['home', 276, 350]],
    traces: ['M156 168V108L110 62H82', 'M138 210H82', 'M156 252V312L118 350H110',
             'M204 168V108L250 62H278', 'M222 210H278', 'M204 252V312L242 350H250', 'M180 252V420'] }
};
const circuitEl = $('#circuit');
const mqMobile = matchMedia('(max-width: 700px)');
let circuitBuilt = false;
function buildCircuit() {
  if (!circuitEl) return;
  const c = mqMobile.matches ? CIRCUITS.m : CIRCUITS.d;
  const [w, h] = c.vb, { x, y, s } = c.chip, cx = x + s / 2, cy = y + s / 2;
  let o = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><radialGradient id="cg"><stop offset="0" stop-color="#FF4D00" stop-opacity=".5"/><stop offset="1" stop-color="#FF4D00" stop-opacity="0"/></radialGradient></defs>`;
  o += `<circle class="chip-glow" cx="${cx}" cy="${cy}" r="${s * 1.3}" fill="url(#cg)"/>`;
  c.traces.forEach((d, i) => { o += `<path class="trace" pathLength="100" style="--i:${i}" d="${d}"/>`; });
  c.traces.forEach((d, i) => { o += `<path class="pulse" pathLength="100" style="--d:${(1.5 + i * .55).toFixed(2)}s" d="${d}"/>`; });
  c.nodes.forEach(([ic, nx, ny], i) => {
    const n = c.ns, p = n * .25;
    o += `<g transform="translate(${nx - n / 2} ${ny - n / 2})"><g class="node" style="--i:${i}"><rect width="${n}" height="${n}" rx="${n * .25}"/><use href="#i-${ic}" class="n-ic" x="${p}" y="${p}" width="${n / 2}" height="${n / 2}"/></g></g>`;
  });
  o += `<g class="chip-wrap"><g class="chip"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * .18}"/><rect x="${x + 8}" y="${y + 8}" width="${s - 16}" height="${s - 16}" rx="${s * .12}" fill="none" stroke="rgba(255,255,255,.08)"/><text class="t1" x="${cx}" y="${cy + c.fs[0] * .12}" style="font-size:${c.fs[0]}px">10</text><text class="t2" x="${cx}" y="${cy + c.fs[0] * .12 + c.fs[1] * 1.7}" style="font-size:${c.fs[1]}px">Mbps</text></g></g>`;
  o += '</svg>';
  circuitEl.innerHTML = o;
  circuitBuilt = true;
}
mqMobile.addEventListener('change', () => { if (circuitBuilt) buildCircuit(); });

/* ---------- Loading awal -> layar terangkat -> hero muncul ---------- */
const loader = $('#loader'), ldMark = $('#ldMark');
let started = false;

function finishNow() {
  html.classList.add('ready', 'logo-on');
  html.classList.remove('loading');
  buildCircuit();
  if (loader) loader.remove();
  started = true;
}
function exitLoader() {
  if (started) return;
  started = true;
  const nl = $('.nav .logo');
  const a = ldMark.getBoundingClientRect(), b = nl.getBoundingClientRect();
  const sc = b.width / a.width;
  ldMark.style.translate = `${(b.left + b.width / 2) - (a.left + a.width / 2)}px ${(b.top + b.height / 2) - (a.top + a.height / 2)}px`;
  ldMark.style.scale = sc.toFixed(3);
  loader.classList.add('go');
  setTimeout(() => { html.classList.add('ready'); buildCircuit(); }, 700);
  setTimeout(() => { html.classList.add('logo-on'); ldMark.style.opacity = 0; }, 1050);
  setTimeout(() => { html.classList.remove('loading'); loader.remove(); }, 1600);
}

const skipLoader = reduce || (CONFIG.loaderOncePerSession && sessionStorage.getItem('aura-seen'));
if (skipLoader || !loader) {
  finishNow();
} else {
  try { sessionStorage.setItem('aura-seen', '1'); } catch (e) { /* abaikan */ }
  const t0 = performance.now();
  const loaded = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r));
  const fontsOk = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fontsOk]).then(() => {
    setTimeout(exitLoader, Math.max(0, CONFIG.loaderMinMs - (performance.now() - t0)));
  });
  setTimeout(exitLoader, 6500);   // pengaman bila ada yang lambat
}
loader && loader.addEventListener('click', () => { if (performance.now() > 1200) exitLoader(); });

/* ---------- Navigasi ---------- */
const nav = $('#nav'), burger = $('#burger'), prog = $('#progress'), fab = $('#fab');
const TOPBAR_H = 52;
let ticking = false;
function onScroll() {
  const y = scrollY;
  html.style.setProperty('--navTop', Math.max(12, TOPBAR_H - y) + 'px');
  const max = html.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
  fab.classList.toggle('show', y > 500);
  wrUpdate();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => requestAnimationFrame(onScroll));

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });
document.addEventListener('click', e => { if (nav.classList.contains('open') && !e.target.closest('.nav-pill')) setMenu(false); });

if ('IntersectionObserver' in window) {
  const navLinks = $$('.links a[href^="#"], .mnav a[href^="#"]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => {
      const on = a.getAttribute('href') === '#' + e.target.id && !a.classList.contains('btn');
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['keunggulan', 'jangkauan', 'pasang', 'paket', 'faq'].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
}

/* ---------- Teks menyala kata demi kata saat di-scroll ---------- */
function wrUpdate() {
  const vh = innerHeight;
  for (const el of wrEls) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) continue;
    const p = reduce ? 1 : clamp((vh * .9 - r.top) / (vh * .42), 0, 1);
    const n = el._w.length;
    el._w.forEach((s, i) => { s.style.opacity = (.18 + .82 * clamp(p * (n + 1.5) - i, 0, 1)).toFixed(2); });
  }
}

/* ---------- Muncul saat scroll + hitungan harga ---------- */
const prices = $$('[data-count]');
if (!reduce) prices.forEach(el => { el.textContent = '0'; });
function countTo(el) {
  const to = +el.dataset.count, dur = 1700, s = performance.now();
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
  const cio = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { countTo(e.target); o.unobserve(e.target); } }), { threshold: .6 });
  prices.forEach(el => cio.observe(el));
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
  const hero = $('.hero');
  if (hero) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--gy', (e.clientY - r.top) + 'px');
  }, { passive: true });
}

/* ---------- Dekorasi kecil ---------- */
$$('.row').forEach(r => { r.innerHTML += r.innerHTML; });            // marquee mulus
const eq = $('#eq');
if (eq) eq.innerHTML = Array.from({ length: 34 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

/* ---------- Bola dunia + daftar area + pengecek ---------- */
(function coverage() {
  const wrap = $('#globe'), cvs = $('#gCanvas'), pinsEl = $('#gpins');
  const listEl = $('#areaList'), form = $('#checker'), input = $('#areaInput'), result = $('#areaResult');
  if (!wrap || !cvs || !listEl) return;
  const ctx = cvs.getContext('2d');
  const D = Math.PI / 180;
  const PL = [[20, -100], [34, -52], [8, -8], [26, 30], [12, 72], [30, 112]];
  const loc = i => PL[i] || [10 + (i * 13) % 30, -120 + (i * 47) % 240];

  /* titik daratan (pseudo benua) */
  const land = (la, lo) => {
    const v = Math.sin(lo * 1.3 + .4) * Math.cos(la * 1.8) + Math.sin(lo * 2.7 - la * 1.5 + 1.1) * .6 +
              Math.cos(lo * .8 + la * 2.6 - .7) * .55 + Math.sin(la * 4.1 + lo * 1.9) * .3;
    return v > .5;
  };
  const pts = [], step = 3.3 * D;
  for (let la = -84 * D; la <= 84 * D; la += step) {
    const n = Math.max(1, Math.round(2 * Math.PI * Math.cos(la) / step));
    const off = (Math.round((la + Math.PI / 2) / step) % 2) * .5;
    for (let k = 0; k < n; k++) {
      const lo = (k + off) / n * 2 * Math.PI - Math.PI;
      if (land(la, lo)) pts.push({ cl: Math.cos(la), sl: Math.sin(la), lo });
    }
  }

  let S = 0, R = 0, cx = 0, cy = 0, dpr = 1, bg = null;
  let rot = 0, tilt = .3, tRot = null, tTilt = .3, hold = 0, vis = false, act = 0, lblW = 90;

  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    S = wrap.getBoundingClientRect().width;
    cvs.width = Math.round(S * dpr); cvs.height = Math.round(S * dpr);
    cx = S / 2; cy = S * .5; R = S * .36;
    bg = document.createElement('canvas'); bg.width = cvs.width; bg.height = cvs.height;
    const g = bg.getContext('2d'); g.scale(dpr, dpr);
    let gr = g.createRadialGradient(cx, cy, R * .92, cx, cy, R * 1.34);
    gr.addColorStop(0, 'rgba(255,92,20,.95)'); gr.addColorStop(.18, 'rgba(255,77,0,.55)'); gr.addColorStop(.5, 'rgba(255,60,0,.14)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.34, 0, 7); g.fill();
    gr = g.createRadialGradient(cx - R * .25, cy - R * .3, R * .1, cx, cy, R);
    gr.addColorStop(0, '#1b0e18'); gr.addColorStop(.7, '#0b0610'); gr.addColorStop(1, '#050308');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    gr = g.createRadialGradient(cx, cy, R * .78, cx, cy, R);
    gr.addColorStop(0, 'rgba(255,100,20,0)'); gr.addColorStop(1, 'rgba(255,115,35,.6)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,150,70,.9)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  }

  /* pin HTML + daftar area */
  pinsEl.innerHTML = COVERAGE.map((a, i) => {
    const soon = a.status === 'segera';
    return `<button class="gpin${soon ? ' soon' : ''}" type="button" data-i="${i}" aria-label="${esc(a.name)}${soon ? ' (segera)' : ''}"><span class="gl">${esc(a.name)}${soon ? ' (segera)' : ''}</span></button>`;
  }).join('');
  listEl.innerHTML = COVERAGE.map((a, i) =>
    `<li><button class="area${a.status === 'segera' ? ' soon' : ''}" type="button" data-i="${i}" aria-pressed="false"><span class="dot"></span><span>${esc(a.name)}</span>${a.status === 'segera' ? '<span class="soon-tag">Segera</span>' : ''}</button></li>`
  ).join('');
  const pins = $$('.gpin', pinsEl), areaBtns = $$('.area', listEl);

  function setActive(i, focus) {
    act = i;
    pins.forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    areaBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const gl = $('.gl', pins[i]); if (gl) lblW = gl.offsetWidth || 90;
    if (focus) {
      const [la, lo] = loc(i);
      tRot = -lo * D; tTilt = clamp(la * D * .6 + .1, .1, .5);
      hold = performance.now() + 6000;
    }
  }
  areaBtns.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i, true)));
  pins.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i, true)));

  const shortest = d => { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  function frame(now, dt) {
    if (now < hold && tRot !== null) {
      rot += shortest(tRot - rot) * .07 * dt; tilt += (tTilt - tilt) * .07 * dt;
    } else {
      rot += .0022 * dt; tilt += (.3 - tilt) * .02 * dt;
    }
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(bg, 0, 0, S, S);
    for (const p of pts) {
      const lo = p.lo + rot;
      const x = p.cl * Math.sin(lo), z0 = p.cl * Math.cos(lo);
      const y = p.sl * ct - z0 * st, z = p.sl * st + z0 * ct;
      if (z <= .03) continue;
      ctx.fillStyle = `rgba(236,236,242,${(.22 + .78 * z).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(cx + R * x, cy - R * y, R * .0105 * (.55 + .7 * z), 0, 6.2832); ctx.fill();
    }
    /* posisi pin */
    pins.forEach((b, i) => {
      const [la, lo0] = loc(i), lo = lo0 * D + rot, cl = Math.cos(la * D), sl = Math.sin(la * D);
      const x = cl * Math.sin(lo), z0 = cl * Math.cos(lo);
      const y = sl * ct - z0 * st, z = sl * st + z0 * ct;
      const px = cx + R * x, py = cy - R * y;
      b.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
      const show = z > .12 && py < S * .74;
      b.style.opacity = show ? Math.min(1, (z - .12) * 5).toFixed(2) : 0;
      b.style.pointerEvents = show ? 'auto' : 'none';
      if (i === act) {
        const half = lblW / 2 + 10;
        const sh = px - half < 6 ? 6 - (px - half) : (px + half > S - 6 ? (S - 6) - (px + half) : 0);
        b.style.setProperty('--sx', sh.toFixed(1) + 'px');
      }
    });
  }

  layout(); setActive(0, false);
  addEventListener('resize', () => { layout(); if (reduce) frame(performance.now(), 1); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setActive(act, false));
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; })).observe(wrap);
  else vis = true;
  let last = performance.now();
  if (reduce) frame(last, 1);
  else (function loop(now) { const dt = Math.min((now - last) / 16.667, 3); last = now; if (vis) frame(now, dt); requestAnimationFrame(loop); })(last);

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
      setActive(i, true);
      if (a.status === 'segera') show('soon', `${a.name} masuk rencana perluasan. Hubungi kami untuk info terbaru.`);
      else show('ok', `${a.name} termasuk area layanan Aura Net. Hubungi kami untuk jadwal pemasangan.`);
    } else {
      setActive(hits[0].i, true);
      show('ok', `Ditemukan ${hits.length} wilayah: ${hits.map(h => h.a.name).join(', ')}. Pilih salah satu dari daftar.`);
    }
  });
})();

/* ---------- Cara pasang: tab otomatis berganti ---------- */
(function steps() {
  const tabsEl = $('#tabs'), stage = $('#stage'), bar = $('#tabProg');
  if (!tabsEl || !stage) return;
  const tabs = $$('.tab', tabsEl), slides = $$('.slide', stage);
  let cur = 0, inView = false;
  function restart() {
    bar.classList.remove('run'); void bar.offsetWidth;
    if (inView && !reduce) bar.classList.add('run');
  }
  function go(i) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => { t.classList.toggle('on', k === cur); t.setAttribute('aria-selected', String(k === cur)); });
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    restart();
  }
  tabs.forEach((t, k) => t.addEventListener('click', () => go(k)));
  bar.addEventListener('animationend', () => go(cur + 1));
  [tabsEl, stage].forEach(el => {
    el.addEventListener('pointerenter', () => tabsEl.classList.add('paused'));
    el.addEventListener('pointerleave', () => tabsEl.classList.remove('paused'));
    el.addEventListener('focusin', () => tabsEl.classList.add('paused'));
    el.addEventListener('focusout', () => tabsEl.classList.remove('paused'));
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; restart(); }), { threshold: .35 }).observe(stage);
})();

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

onScroll();
})();
