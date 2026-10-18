(function () {
  'use strict';

  var WA_NUMBER = '62895630094597'; // 0895630094597
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- Mode gelap / terang ---------- */
  var saved = null;
  try { saved = localStorage.getItem('aura-theme'); } catch (e) {}
  var prefersDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  $('#theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    var r = this.getBoundingClientRect();
    root.style.setProperty('--tx', (r.left + r.width / 2) + 'px');
    root.style.setProperty('--ty', (r.top + r.height / 2) + 'px');
    function apply() { root.setAttribute('data-theme', next); }
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply); else apply();
    try { localStorage.setItem('aura-theme', next); } catch (e) {}
  });

  /* ---------- Opening ala logo reveal ---------- */
  var heroH1 = $('.hero h1');
  function endIntro() {
    var intro = $('#intro');
    intro.classList.add('out');                       // logo membesar memenuhi layar
    setTimeout(function () {
      intro.classList.add('gone');                    // layar tersapu ke atas
      document.body.classList.remove('is-loading');
      setTimeout(function () { heroH1.classList.add('in'); }, 350);
    }, 800);
    setTimeout(function () { intro.remove(); }, 1900);
  }
  var introDone = false;
  function startOut() { if (!introDone) { introDone = true; endIntro(); } }
  var minTime = new Promise(function (r) { setTimeout(r, 3000); });
  var loaded = new Promise(function (r) {
    if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
  });
  Promise.all([minTime, loaded]).then(startOut);
  setTimeout(startOut, 6000);

  /* ---------- Pecah kata untuk animasi judul ---------- */
  document.querySelectorAll('.hero h1, .sec-head h2').forEach(function (el) {
    var text = el.textContent.trim(), words = text.split(/\s+/);
    el.setAttribute('aria-label', text);
    el.classList.add('split');
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
  });

  /* ---------- Navbar ---------- */
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(function (n) {
      var to = +n.dataset.count, t0 = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
        n.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  /* ---------- Muncul saat scroll ---------- */
  var targets = document.querySelectorAll('.sec-head h2, .sec-head p, .plan, .area, .signup, .perks article, .steps li, .uses li, .faq, .checker, .note');
  targets.forEach(function (el) {
    if (el.matches('h2')) return;
    el.classList.add('reveal');
    if (el.matches('.plan, .area')) el.classList.add('clip');
    else if (el.matches('.perks article, .steps li')) el.classList.add('pop');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); if (en.target.matches('.plan')) countUp(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el, i) {
      el.style.transitionDelay = el.matches('.area, .perks article, .steps li') ? (i % 4) * 0.12 + 's' : '0s';
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Toast ---------- */
  var toast = $('#toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3600);
  }

  /* ---------- Form pendaftaran -> WhatsApp ---------- */
  var form = $('#form');
  var rules = {
    nama: function (v) { return v.length < 3 ? 'Tulis nama lengkap, minimal 3 huruf.' : ''; },
    alamat: function (v) { return v.length < 10 ? 'Alamat terlalu singkat. Tulis jalan, nomor rumah, dan patokan.' : ''; }
  };

  function check(field) {
    var msg = rules[field.name](field.value.trim());
    field.classList.toggle('invalid', !!msg);
    form.querySelector('.err[data-for="' + field.name + '"]').textContent = msg;
    return !msg;
  }
  form.querySelectorAll('input, textarea').forEach(function (f) {
    f.addEventListener('input', function () { if (f.classList.contains('invalid')) check(f); });
    f.addEventListener('blur', function () { check(f); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('input, textarea').forEach(function (f) { if (!check(f)) ok = false; });
    if (!ok) {
      var firstBad = form.querySelector('.invalid');
      if (firstBad) firstBad.focus();
      return;
    }
    var nama = form.nama.value.trim();
    var alamat = form.alamat.value.trim();
    var text =
      'Halo Aura Net, saya ingin memasang internet.\n\n' +
      'Paket: 10 Mbps (Rp150.000/bulan)\n' +
      'Nama: ' + nama + '\n' +
      'Alamat: ' + alamat;
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
    showToast('Membuka WhatsApp…');
    window.open(url, '_blank', 'noopener');
    form.reset();
  });

  /* ---------- Cek area ---------- */
  var COVERED = ['parit masigi 1', 'parit masigi', 'jalan kemuning', 'kemuning'];
  var res = $('#checkResult');
  $('#checker').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('#lokasi').value.trim().toLowerCase().replace(/\s+/g, ' ');
    res.className = 'check-result';
    if (q.length < 3) { res.textContent = 'Ketik nama desa, kelurahan, atau perumahan Anda.'; return; }
    var hit = COVERED.some(function (c) { return q.indexOf(c) > -1 || c.indexOf(q) > -1; });
    if (hit) {
      res.classList.add('ok');
      res.textContent = 'Kabar baik, lokasi Anda sudah terjangkau Aura Net. Silakan daftar di bagian bawah.';
    } else {
      res.classList.add('no');
      var link = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Aura Net, apakah lokasi ' + $('#lokasi').value.trim() + ' sudah terjangkau?');
      res.innerHTML = 'Lokasi itu belum ada di daftar. <a href="' + link + '" target="_blank" rel="noopener">Hubungi kami</a>, kami cek langsung.';
    }
  });

  /* ---------- Salin nomor ---------- */
  $('#copy').addEventListener('click', function () {
    var num = '0895630094597';
    function done() { showToast('Nomor 0895 6300 94597 sudah disalin.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(num).then(done, function () { showToast('Gagal menyalin. Ketuk nomornya untuk menelepon.'); });
    } else {
      var t = document.createElement('textarea'); t.value = num; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (er) { showToast('Gagal menyalin.'); }
      t.remove();
    }
  });

  /* ---------- FAQ: satu terbuka sekaligus ---------- */
  var items = document.querySelectorAll('.faq details');
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Transisi pindah bagian (wipe) ---------- */
  var wipe = $('#wipe'), wipeLabel = $('#wipeLabel'), busy = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || busy || reduce) return;
    var id = a.getAttribute('href');
    var target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    busy = true;
    var name = a.dataset.label || (target.querySelector('h2') ? target.querySelector('h2').getAttribute('aria-label') : '') || a.textContent.trim();
    var map = { '#beranda': 'Beranda', '#keunggulan': 'Keunggulan', '#paket': 'Paket', '#area': 'Area layanan', '#cara-pasang': 'Cara pasang', '#faq': 'Tanya jawab', '#daftar': 'Daftar' };
    wipeLabel.textContent = map[id] || name;
    wipe.className = 'wipe in';
    setTimeout(function () {
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView();
      root.style.scrollBehavior = '';
      wipe.className = 'wipe leave';
      setTimeout(function () { wipe.className = 'wipe'; busy = false; }, 1000);
    }, 900);
  });

  /* ---------- Scroll: progres, band bergerak, parallax ---------- */
  var progress = $('#progress'), tracks = [], art = $('#art'), heroText = $('.hero-text');
  document.querySelectorAll('.track').forEach(function (t) {
    t.innerHTML += t.innerHTML + t.innerHTML + t.innerHTML;
    tracks.push({ el: t, dir: +t.dataset.dir, x: 0 });
  });
  var last = window.scrollY, boost = 0;
  function frame() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    boost = boost * 0.92 + Math.abs(y - last) * 0.12; last = y;
    tracks.forEach(function (t) {
      var w = t.el.scrollWidth / 4;
      t.x += t.dir * (0.7 + boost);
      if (t.x <= -w) t.x += w; if (t.x > 0) t.x -= w;
      t.el.style.transform = 'translate3d(' + t.x + 'px,0,0)';
    });
    if (art && y < innerHeight * 1.2 && !reduce) {
      art.style.transform = 'translateY(' + (y * 0.12) + 'px)';
      heroText.style.transform = 'translateY(' + (y * -0.06) + 'px)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Kartu paket miring mengikuti kursor ---------- */
  var plan = $('.plan');
  if (plan && matchMedia('(hover: hover)').matches && !reduce) {
    plan.addEventListener('mousemove', function (e) {
      var r = plan.getBoundingClientRect();
      plan.classList.add('tilt');
      plan.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
      plan.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -8 + 'deg');
    });
    plan.addEventListener('mouseleave', function () { plan.classList.remove('tilt'); });
  }

  $('#year').textContent = new Date().getFullYear();
})();
