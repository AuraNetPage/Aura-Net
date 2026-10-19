(function () {
  'use strict';

  var WA = '62895630094597'; // 0895630094597
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Tema gelap / terang ---------- */
  var saved = null;
  try { saved = localStorage.getItem('aura-theme-v2'); } catch (e) {}
  root.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light'); // default selalu terang
  $('#theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    var r = this.getBoundingClientRect();
    root.style.setProperty('--tx', (r.left + r.width / 2) + 'px');
    root.style.setProperty('--ty', (r.top + r.height / 2) + 'px');
    var apply = function () { root.setAttribute('data-theme', next); };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
    try { localStorage.setItem('aura-theme-v2', next); } catch (e) {}
  });

  /* ---------- Pecah kata untuk judul ---------- */
  function splitText(el) {
    var n = 0;
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'), s = document.createElement('span');
            w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', n++); s.textContent = p;
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    el.classList.add('split');
  }
  $$('.hero h1, h2').forEach(splitText);

  /* ---------- Opening: cincin + titik, tirai naik ---------- */
  var loader = $('#loader'), startedAt = performance.now(), MIN = reduce ? 0 : 3900, finished = false;
  function heroIn() {
    $('.hero h1').classList.add('in');
    $$('.hero .rv').forEach(function (el, i) { el.style.setProperty('--d', (0.2 + i * 0.12) + 's'); el.classList.add('in'); });
  }
  function finishLoading() {
    if (finished) return; finished = true;
    loader.classList.add('is-done');
    document.body.classList.remove('loading');
    window.scrollTo(0, 0);
    setTimeout(heroIn, reduce ? 0 : 450);
    setTimeout(function () { loader.remove(); }, 1500);
  }
  function schedule() { setTimeout(finishLoading, Math.max(0, MIN - (performance.now() - startedAt))); }
  if (document.readyState === 'complete') schedule(); else window.addEventListener('load', schedule);
  setTimeout(finishLoading, 8000);

  /* ---------- Muncul saat scroll + hitung angka ---------- */
  function countUp(box) {
    $$('[data-count]', box).forEach(function (n) {
      var to = +n.dataset.count, s = performance.now();
      (function step(t) {
        var p = Math.min((t - s) / 1500, 1);
        n.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      })(s);
    });
  }
  var targets = $$('.rv, .split, .steps li').filter(function (el) { return !el.closest('.hero'); });
  targets.forEach(function (el, i) {
    if (el.matches('.steps li')) return;
    var sib = el.parentElement ? $$(':scope > .rv', el.parentElement) : [];
    if (el.matches('.rv') && sib.length > 1) el.style.setProperty('--d', (sib.indexOf(el) * 0.1) + 's');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.querySelector('[data-count]')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Menu mobile ---------- */
  var burger = $('#burger'), mmenu = $('#mmenu');
  function setMenu(o) {
    mmenu.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o);
    burger.setAttribute('aria-label', o ? 'Tutup menu' : 'Buka menu');
  }
  burger.addEventListener('click', function () { setMenu(!mmenu.classList.contains('open')); });

  /* ---------- Transisi pindah bagian ---------- */
  var wipe = $('#wipe'), label = $('#wipeLabel'), busy = false;
  var names = { '#beranda': 'Beranda', '#keunggulan': 'Keunggulan', '#paket': 'Paket', '#area': 'Area layanan', '#cara-pasang': 'Cara pasang', '#faq': 'Tanya jawab', '#daftar': 'Daftar' };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href'), target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    if (busy) return;
    if (reduce) { setMenu(false); target.scrollIntoView(); return; }
    busy = true;
    label.textContent = names[id] || a.textContent.trim();
    wipe.className = 'wipe in';
    setTimeout(function () {
      setMenu(false);
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView();
      root.style.scrollBehavior = '';
      wipe.className = 'wipe leave';
      setTimeout(function () {
        wipe.className = 'wipe reset';
        void wipe.offsetWidth;
        wipe.className = 'wipe';
        busy = false;
      }, 950);
    }, 1000);
  });

  /* ---------- Loop scroll: progres, band, kartu bertumpuk, parallax ---------- */
  var progress = $('#progress'), art = $('#art'), heroMain = $('#heroMain'), cards = $$('.card');
  var tracks = $$('.track').map(function (t) {
    t.innerHTML = t.innerHTML + t.innerHTML + t.innerHTML + t.innerHTML;
    return { el: t, dir: +t.dataset.dir, x: 0 };
  });
  var lastY = window.scrollY, boost = 0;
  function frame() {
    var y = window.scrollY, max = root.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    boost = boost * 0.9 + Math.min(Math.abs(y - lastY), 60) * 0.1; lastY = y;
    if (!reduce) tracks.forEach(function (t) {
      var w = t.el.scrollWidth / 4;
      t.x += t.dir * (0.8 + boost);
      if (t.x <= -w) t.x += w;
      if (t.x > 0) t.x -= w;
      t.el.style.transform = 'translate3d(' + t.x + 'px,0,0)';
    });
    if (!reduce) {
      cards.forEach(function (c, i) {
        var nx = cards[i + 1]; if (!nx) return;
        var top = parseFloat(getComputedStyle(c).top) || 0;
        var h = c.offsetHeight, d = nx.getBoundingClientRect().top - top;
        var p = Math.max(0, Math.min(1, 1 - d / h));
        c.style.transform = 'scale(' + (1 - p * 0.07) + ')';
        c.style.filter = 'brightness(' + (1 - p * 0.25) + ')';
      });
      if (y < innerHeight * 1.3) {
        art.style.transform = 'translateY(' + (y * 0.1) + 'px)';
        heroMain.style.transform = 'translateY(' + (y * -0.05) + 'px)';
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Kursor & efek magnet ---------- */
  if (fine && !reduce) {
    var cur = $('#cur'), cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('big', !!e.target.closest('a, button, summary, .qa button')); });
    $$('.btn, .fab, .theme').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px';
      });
      b.addEventListener('mouseleave', function () { b.style.translate = ''; });
    });
  }

  /* ---------- Toast ---------- */
  var toast = $('#toast'), tt;
  function showToast(m) { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 3600); }

  /* ---------- Cek area ---------- */
  var COVERED = ['parit masigi 1', 'parit masigi', 'jalan kemuning', 'kemuning'], res = $('#checkResult');
  $('#checker').addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = $('#lokasi').value.trim(), q = raw.toLowerCase().replace(/\s+/g, ' ');
    res.className = 'check-result';
    if (q.length < 3) { res.textContent = 'Ketik nama desa, kelurahan, atau perumahan Anda.'; return; }
    var hit = COVERED.some(function (c) { return q.indexOf(c) > -1 || c.indexOf(q) > -1; });
    if (hit) { res.classList.add('ok'); res.textContent = 'Kabar baik, lokasi Anda sudah terjangkau Aura Net. Silakan daftar di bagian bawah.'; }
    else {
      res.classList.add('no');
      var link = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Halo Aura Net, apakah lokasi ' + raw + ' sudah terjangkau?');
      res.innerHTML = 'Lokasi itu belum ada di daftar. <a href="' + link + '" target="_blank" rel="noopener">Hubungi kami</a>, kami cek langsung.';
    }
  });

  /* ---------- FAQ ---------- */
  $$('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.parentElement, open = !item.classList.contains('open');
      $$('.qa').forEach(function (q) { q.classList.remove('open'); $('button', q).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Salin nomor ---------- */
  $('#copy').addEventListener('click', function () {
    var num = '0895630094597', ok = function () { showToast('Nomor 0895 6300 94597 sudah disalin.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(num).then(ok, function () { showToast('Gagal menyalin. Ketuk nomornya untuk menelepon.'); });
    else { var t = document.createElement('textarea'); t.value = num; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (er) { showToast('Gagal menyalin.'); } t.remove(); }
  });

  /* ---------- Form -> WhatsApp ---------- */
  var form = $('#form');
  var rules = {
    nama: function (v) { return v.length < 3 ? 'Tulis nama lengkap, minimal 3 huruf.' : ''; },
    alamat: function (v) { return v.length < 10 ? 'Alamat terlalu singkat. Tulis jalan, nomor rumah, dan patokan.' : ''; }
  };
  function check(f) {
    var m = rules[f.name](f.value.trim());
    f.classList.toggle('invalid', !!m);
    $('.err[data-for="' + f.name + '"]', form).textContent = m;
    return !m;
  }
  $$('input, textarea', form).forEach(function (f) {
    f.addEventListener('input', function () { if (f.classList.contains('invalid')) check(f); });
    f.addEventListener('blur', function () { check(f); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('input, textarea', form).forEach(function (f) { if (!check(f)) ok = false; });
    if (!ok) { var bad = $('.invalid', form); if (bad) bad.focus(); return; }
    var text = 'Halo Aura Net, saya ingin memasang internet.\n\nPaket: 10 Mbps (Rp150.000/bulan)\nNama: ' + form.nama.value.trim() + '\nAlamat: ' + form.alamat.value.trim();
    showToast('Membuka WhatsApp…');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
