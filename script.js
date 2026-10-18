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
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('aura-theme', next); } catch (e) {}
  });

  /* ---------- Opening ---------- */
  function endIntro() {
    var intro = $('#intro');
    intro.classList.add('out');
    document.body.classList.remove('is-loading');
    setTimeout(function () { intro.remove(); }, 1000);
  }
  var introDone = false;
  function startOut() { if (!introDone) { introDone = true; endIntro(); } }
  var minTime = new Promise(function (r) { setTimeout(r, 2600); });
  var loaded = new Promise(function (r) {
    if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
  });
  Promise.all([minTime, loaded]).then(startOut);
  setTimeout(startOut, 5000); // jaga-jaga kalau koneksi lambat

  /* ---------- Navbar ---------- */
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
  var targets = document.querySelectorAll('.sec-head, .plan, .area, .signup, .perks article, .steps li, .uses li, .faq, .checker');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el, i) {
      el.style.transitionDelay = el.matches('.area, .perks article, .steps li') ? (i % 4) * 0.1 + 's' : '0s';
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

  $('#year').textContent = new Date().getFullYear();
})();
