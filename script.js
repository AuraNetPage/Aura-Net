/* =========================================================
   AURA NET v2 — SCRIPT
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

html.classList.add('hx');

/* ---------- Pecah kata (untuk animasi judul) ---------- */
function split(el, start = 0) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => `<span class="w"><span style="--i:${start + i}">${esc(w)}</span></span>`).join(' ');
  return words.length;
}
let wi = 0;
$$('#h1 [data-split]').forEach(el => { wi += split(el, wi); });
$$('.split').forEach(el => split(el));
const wordmark = $('#wordmark');
if (wordmark) split(wordmark);

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

/* ---------- Kata berganti di judul hero ---------- */
const rws = $$('#rot .rw');
let ri = 0, rotTimer;
function nextWord() {
  if (rws.length < 2) return;
  const cur = rws[ri];
  ri = (ri + 1) % rws.length;
  const nx = rws[ri];
  cur.classList.remove('on'); cur.classList.add('out');
  nx.classList.remove('out'); nx.classList.add('on');
  setTimeout(() => cur.classList.remove('out'), 950);
}

/* ---------- Loader (hitungan persen) -> tirai terbuka ---------- */
const loadNum = $('#loadNum');
let started = false;
function ready() {
  if (started) return;
  started = true;
  html.classList.add('ready');
  if (!reduce) rotTimer = setInterval(nextWord, 2600);
  setTimeout(() => { const l = $('#loader'); if (l) l.remove(); }, 1400);
}
if (reduce) {
  ready();
} else {
  const t0 = performance.now();
  let loaded = false, shown = 0;
  Promise.all([
    new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r)),
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
  ]).then(() => { loaded = true; });
  (function count(now) {
    if (started) return;
    const t = Math.min((now - t0) / 1500, 1);
    const target = loaded ? 100 : Math.min(88, t * 100);
    shown += (target - shown) * .12;
    if (loadNum) loadNum.textContent = Math.round(shown);
    if (loaded && t >= 1 && shown > 99.3) {
      if (loadNum) loadNum.textContent = '100';
      setTimeout(ready, 280);
      return;
    }
    requestAnimationFrame(count);
  })(performance.now());
  setTimeout(ready, 3800);
}

/* ---------- Navigasi ---------- */
const nav = $('#nav'), links = $('#links'), ind = $('#navInd'), burger = $('#burger'), menu = $('#menu');
const linkEls = $$('a', links);
let activeLink = null, menuOpen = false;

function moveInd(a) {
  if (!a) { ind.style.opacity = 0; linkEls.forEach(l => l.classList.remove('hot')); return; }
  ind.style.opacity = 1;
  ind.style.width = a.offsetWidth + 'px';
  ind.style.transform = `translateX(${a.offsetLeft}px)`;
  linkEls.forEach(l => l.classList.toggle('hot', l === a));
}
linkEls.forEach(a => {
  a.addEventListener('mouseenter', () => moveInd(a));
  a.addEventListener('focus', () => moveInd(a));
});
links.addEventListener('mouseleave', () => moveInd(activeLink));
addEventListener('resize', () => moveInd(activeLink));

function setMenu(open) {
  menuOpen = open;
  menu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  document.body.style.overflow = open ? 'hidden' : '';
  nav.classList.remove('hide');
}
burger.addEventListener('click', () => setMenu(!menuOpen));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860 && menuOpen) setMenu(false); });

if ('IntersectionObserver' in window) {
  const map = new Map(linkEls.map(a => [a.getAttribute('href').slice(1), a]));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    activeLink = map.get(e.target.id) || null;
    moveInd(activeLink);
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['paket', 'jangkauan', 'pasang', 'faq'].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });
  const heroEl = $('#top');
  if (heroEl) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { activeLink = null; moveInd(null); } }), { rootMargin: '-45% 0px -50% 0px' }).observe(heroEl);
}

/* ---------- Scroll: progres, tombol, parallax, kartu bertumpuk ---------- */
const totop = $('#totop'), prg = $('#totopPrg'), fab = $('#fab'), big10 = $('#big10');
const cards = $$('.scard');
let lastY = scrollY, ticking = false;
const CIRC = 131.9;

function stackUpdate() {
  cards.forEach((c, i) => {
    if (i === cards.length - 1) return;
    const next = cards[i + 1];
    const stickTop = parseFloat(getComputedStyle(next).top) || 0;
    const d = next.getBoundingClientRect().top - stickTop;
    const p = clamp(1 - d / c.offsetHeight, 0, 1);
    c.style.transform = `scale(${(1 - p * .05).toFixed(4)})`;
    c.style.setProperty('--p', p.toFixed(3));
  });
}
function onScroll() {
  const y = scrollY, dy = y - lastY;
  if (!menuOpen) {
    if (dy > 4 && y > 220) nav.classList.add('hide');
    else if (dy < -4 || y < 120) nav.classList.remove('hide');
  }
  lastY = y;
  const max = html.scrollHeight - innerHeight;
  prg.style.strokeDashoffset = (CIRC * (1 - (max > 0 ? clamp(y / max, 0, 1) : 0))).toFixed(2);
  totop.classList.toggle('show', y > 500);
  fab.classList.toggle('show', y > 500);
  if (big10 && !reduce) {
    const r = big10.getBoundingClientRect();
    if (r.bottom > -200 && r.top < innerHeight + 200) {
      const off = r.top + r.height / 2 - innerHeight / 2;
      big10.style.transform = `translateY(${(-off * .16).toFixed(1)}px)`;
    }
  }
  if (!reduce) stackUpdate();
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll);
onScroll();
totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

/* ---------- Muncul saat scroll ---------- */
const price = $('[data-count]');
if (price && !reduce) price.textContent = '0';
function countTo(el) {
  const to = +el.dataset.count, dur = 1700, s = performance.now();
  (function f(n) {
    const p = Math.min((n - s) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('id-ID');
    if (p < 1) requestAnimationFrame(f);
  })(s);
}

/* Odometer nomor telepon */
const odo = $('#odo');
if (odo) {
  let k = 0;
  odo.innerHTML = [...CONFIG.phoneDisplay].map(ch => {
    if (/\d/.test(ch)) {
      const col = Array.from({ length: 10 }, (_, n) => `<i>${n}</i>`).join('');
      return `<span class="d" aria-hidden="true"><span class="col" style="--v:${ch};--k:${k++}">${col}</span></span>`;
    }
    return `<span class="sep" aria-hidden="true">${ch}</span>`;
  }).join('');
}

const watch = $$('.reveal, .split, .scard, #wordmark');
if ('IntersectionObserver' in window && !reduce) {
  html.classList.add('rv');
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    o.unobserve(e.target);
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  watch.forEach(el => io.observe(el));

  if (price) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { countTo(price); o.unobserve(e.target); } }), { threshold: .5 }).observe(price);
  if (odo) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { odo.classList.add('on'); o.unobserve(e.target); } }), { threshold: .6 }).observe(odo);
} else {
  watch.forEach(el => el.classList.add('in'));
  if (odo) odo.classList.add('on');
}

/* ---------- Equalizer (tile kecepatan) ---------- */
const eq = $('#eq');
if (eq) eq.innerHTML = Array.from({ length: 30 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

/* ---------- Marquee yang bereaksi pada kecepatan scroll ---------- */
const mqEl = $('#marquee'), track = $('#mqTrack');
let mqW = 0, mqX = 0, mqVel = 0, mqSkew = 0, mqLastY = scrollY, mqIn = true;
function mqBuild() {
  if (!track) return;
  $$('.clone', track).forEach(n => n.remove());
  const group = track.firstElementChild;
  mqW = group.offsetWidth;
  const need = Math.ceil((innerWidth * 1.3) / Math.max(mqW, 1)) + 1;
  for (let i = 0; i < need; i++) { const c = group.cloneNode(true); c.classList.add('clone'); track.append(c); }
}
mqBuild();
addEventListener('resize', mqBuild);
if (mqEl && 'IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { mqIn = e.isIntersecting; })).observe(mqEl);

/* ---------- Kursor, parallax hero, magnet, loop utama ---------- */
const cur = $('#cur');
const hero = $('.hero');
let tx = -100, ty = -100, rx = -100, ry = -100, curShown = false;
let hx = 0, hy = 0, hpx = 0, hpy = 0;

if (fine && !reduce) {
  const dot = $('.cur-dot', cur), ring = $('.cur-ring', cur);
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!curShown) { curShown = true; rx = tx; ry = ty; cur.classList.add('show'); }
    dot.style.transform = `translate(${tx}px,${ty}px)`;
  }, { passive: true });
  document.addEventListener('pointerover', e => {
    cur.classList.toggle('hover', !!e.target.closest('a,button,input,textarea,.blip,.area,.qa'));
  });
  addEventListener('pointerdown', () => cur.classList.add('down'));
  addEventListener('pointerup', () => cur.classList.remove('down'));
  document.addEventListener('pointerleave', () => cur.classList.remove('show'));
  document.addEventListener('pointerenter', () => { if (curShown) cur.classList.add('show'); });
  cur._ring = ring;

  if (hero) hero.addEventListener('pointermove', e => {
    hx = (e.clientX / innerWidth - .5) * 2;
    hy = (e.clientY / innerHeight - .5) * 2;
  });
  if (hero) hero.addEventListener('pointerleave', () => { hx = 0; hy = 0; });

  /* tombol magnet */
  const mags = $$('.mag');
  let mt = false, mev = null;
  addEventListener('pointermove', e => {
    mev = e;
    if (mt) return;
    mt = true;
    requestAnimationFrame(() => {
      mt = false;
      mags.forEach(m => {
        const r = m.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const dx = mev.clientX - (r.left + r.width / 2), dy = mev.clientY - (r.top + r.height / 2);
        const R = Math.max(r.width, r.height) * .75;
        if (Math.hypot(dx, dy) < R) m.style.transform = `translate(${(dx * .26).toFixed(1)}px,${(dy * .38).toFixed(1)}px)`;
        else if (m.style.transform) m.style.transform = '';
      });
    });
  }, { passive: true });
}

let lastT = performance.now();
function loop(now) {
  const dt = Math.min((now - lastT) / 16.667, 3);
  lastT = now;

  if (cur && curShown && cur._ring) {
    rx += (tx - rx) * .2 * dt; ry += (ty - ry) * .2 * dt;
    cur._ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
  }
  if (hero && fine) {
    hpx += (hx - hpx) * .08 * dt; hpy += (hy - hpy) * .08 * dt;
    if (Math.abs(hpx - hx) > .001 || Math.abs(hpy - hy) > .001) {
      hero.style.setProperty('--px', hpx.toFixed(3));
      hero.style.setProperty('--py', hpy.toFixed(3));
    }
  }
  if (track && mqIn && !reduce) {
    const dy = scrollY - mqLastY; mqLastY = scrollY;
    mqVel += (dy - mqVel) * .12;
    mqSkew += (clamp(mqVel * .35, -9, 9) - mqSkew) * .15;
    mqX -= (.8 + Math.min(Math.abs(mqVel) * .4, 16)) * dt;
    if (mqX <= -mqW) mqX += mqW;
    track.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0)`;
    mqEl.style.transform = `rotate(-2.2deg) skewX(${(-mqSkew).toFixed(2)}deg)`;
  }
  requestAnimationFrame(loop);
}
if (!reduce) requestAnimationFrame(loop);

/* ---------- Tiket paket: miring 3D + kilau ---------- */
const ticket = $('#ticket');
if (ticket && fine && !reduce) {
  ticket.addEventListener('pointermove', e => {
    const r = ticket.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    ticket.style.transform = `rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg)`;
    ticket.style.setProperty('--gx', (px + .5) * 100 + '%');
    ticket.style.setProperty('--gy', (py + .5) * 100 + '%');
  });
  ticket.addEventListener('pointerleave', () => { ticket.style.transform = ''; });
}

/* ---------- Confetti ---------- */
const cv = $('#confetti'), cctx = cv.getContext('2d');
let parts = [], crun = false;
function burst(x, y) {
  if (reduce) return;
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ['#2B33FF', '#FF6A2B', '#7CF2C9', '#FF9BD2', '#F7F7FF', '#12101A'];
  for (let i = 0; i < 56; i++) {
    const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 7, h: 4 + Math.random() * 5, c: colors[i % colors.length], life: 1 });
  }
  if (!crun) { crun = true; requestAnimationFrame(cstep); }
}
function cstep() {
  cctx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.vy += .35; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .012;
    cctx.save(); cctx.globalAlpha = Math.max(p.life, 0); cctx.translate(p.x, p.y); cctx.rotate(p.r);
    cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cctx.restore();
  });
  if (parts.length) requestAnimationFrame(cstep);
  else { crun = false; cctx.clearRect(0, 0, cv.width, cv.height); }
}
$$('[data-confetti]').forEach(b => b.addEventListener('click', e => burst(e.clientX, e.clientY)));

/* ---------- Jangkauan: radar + pengecek area ---------- */
(function coverage() {
  const radar = $('#radar'), listEl = $('#areaList'), form = $('#checker'), input = $('#areaInput'), result = $('#areaResult');
  if (!radar || !listEl) return;

  const n = COVERAGE.length, T = 6;
  const pts = COVERAGE.map((a, i) => {
    const phi = ((i * 360 / n) + (i % 2 ? 20 : -14) + 360) % 360;
    const rr = i % 2 ? .74 : .44, rad = phi * Math.PI / 180;
    return { phi, x: 50 + Math.sin(rad) * rr * 50, y: 50 - Math.cos(rad) * rr * 50 };
  });

  pts.forEach((p, i) => {
    const a = COVERAGE[i], soon = a.status === 'segera';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'blip' + (soon ? ' soon' : '') + (p.y < 22 ? ' below' : '');
    b.dataset.i = i;
    b.style.cssText = `--x:${p.x.toFixed(2)}%;--y:${p.y.toFixed(2)}%;--dl:${(p.phi / 360 * T).toFixed(2)}s`;
    b.setAttribute('aria-label', a.name + (soon ? ' (segera)' : ''));
    b.innerHTML = `<i></i><span class="blip-label">${esc(a.name)}${soon ? ' (segera)' : ''}</span>`;
    radar.append(b);
  });

  listEl.innerHTML = COVERAGE.map((a, i) =>
    `<li><button class="area ${a.status === 'segera' ? 'soon' : ''}" type="button" data-i="${i}" aria-pressed="false"><span class="dot"></span><span>${esc(a.name)}</span>${a.status === 'segera' ? '<span class="soon-tag">Segera</span>' : ''}</button></li>`
  ).join('');

  const blips = $$('.blip', radar), areaBtns = $$('.area', listEl);

  function setActive(i) {
    blips.forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    areaBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const b = blips[i];
    if (!b) return;
    const label = $('.blip-label', b);
    label.style.setProperty('--sx', '0px');
    requestAnimationFrame(() => {
      const wr = radar.getBoundingClientRect(), lr = label.getBoundingClientRect();
      let shift = 0;
      if (lr.left < wr.left + 6) shift = wr.left + 6 - lr.left;
      else if (lr.right > wr.right - 6) shift = wr.right - 6 - lr.right;
      label.style.setProperty('--sx', shift.toFixed(1) + 'px');
    });
  }
  areaBtns.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i)));
  blips.forEach(b => b.addEventListener('click', () => setActive(+b.dataset.i)));
  setActive(0);

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
    const sb = $('button[type="submit"]', order).getBoundingClientRect();
    burst(sb.left + sb.width / 2, sb.top + sb.height / 2);
    window.open(wa(text), '_blank', 'noopener');
    toast('Membuka WhatsApp');
  });
}

/* ---------- Tahun footer ---------- */
const yr = $('#year');
if (yr) yr.textContent = new Date().getFullYear();

})();
