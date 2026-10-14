// --- INTERACTIVE STATE SWITCHER (FIGMA SMART ANIMATE STYLE) ---
function switchVariant(variant) {
    // Update active button state
    document.querySelectorAll('.var-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-variant="${variant}"]`).classList.add('active');

    // Ubah kelas state pada body untuk memicu transisi warna latar belakang & gradien
    document.body.className = `theme-${variant}-state`;

    // Ambil elemen teks & card untuk diberikan animasi transisi halus
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-desc');
    const badgeTypeEl = document.getElementById('card-badge-type');
    const speedEl = document.getElementById('showcase-speed');
    const showcaseCard = document.querySelector('.showcase-card');

    // Berikan efek animasi masuk (morph bounce)
    showcaseCard.classList.remove('state-morph-anim');
    void showcaseCard.offsetWidth; // Trigger reflow
    showcaseCard.classList.add('state-morph-anim');

    // Atur konten dinamis berdasarkan varian tombol yang ditekan
    if (variant === 'cyan') {
        titleEl.innerHTML = `Koneksi Tanpa Batas, <br><span class="gradient-headline">Performa Home Pro.</span>`;
        descEl.textContent = `Infrastruktur fiber optic optimal untuk aktivitas keluarga, streaming 4K, dan work from home tanpa hambatan.`;
        badgeTypeEl.textContent = 'HOME PRO';
        speedEl.innerHTML = `10 <span>Mbps</span>`;
    } else if (variant === 'magenta') {
        titleEl.innerHTML = `Gaming Tanpa Lag, <br><span class="gradient-headline">Ultra Low Latency.</span>`;
        descEl.textContent = `Jalur khusus router prioritas gaming dengan stabilitas ping maksimal dan bebas gangguan jitter.`;
        badgeTypeEl.textContent = 'GAMING ULTRA';
        speedEl.innerHTML = `25 <span>Mbps</span>`;
    } else if (variant === 'violet') {
        titleEl.innerHTML = `Solusi Bisnis Profesional, <br><span class="gradient-headline">Dedicated Enterprise.</span>`;
        descEl.textContent = `Kapasitas bandwidth simetris penuh dan stabil untuk kelancaran transaksi serta operasional kantor Anda.`;
        badgeTypeEl.textContent = 'ENTERPRISE';
        speedEl.innerHTML = `50 <span>Mbps</span>`;
    }
}

// --- THEME SYSTEM (DARK / LIGHT) ---
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

const activeTheme = localStorage.getItem('auranet_theme') || 'dark';
htmlEl.setAttribute('data-theme', activeTheme);
updateThemeIcon(activeTheme);

themeToggle.addEventListener('click', () => {
    let current = htmlEl.getAttribute('data-theme');
    let target = current === 'dark' ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', target);
    localStorage.setItem('auranet_theme', target);
    updateThemeIcon(target);
});

function updateThemeIcon(theme) {
    if(theme === 'dark') {
        themeIcon.className = 'fa-solid fa-moon';
    } else {
        themeIcon.className = 'fa-solid fa-sun';
    }
}

// --- INTERACTIVE SPOTLIGHT MOUSE TRACKING ---
const spotlightCards = document.querySelectorAll('.spotlight-card');

spotlightCards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// --- BUTTON RIPPLE EFFECT ---
const rippleBtns = document.querySelectorAll('.ripple-btn');

rippleBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        let x = e.clientX - e.target.getBoundingClientRect().left;
        let y = e.clientY - e.target.getBoundingClientRect().top;

        let span = document.createElement('span');
        span.classList.add('ripple');
        span.style.left = x + 'px';
        span.style.top = y + 'px';
        this.appendChild(span);

        setTimeout(() => {
            span.remove();
        }, 600);
    });
});

// --- STRICT COVERAGE CHECKER (PARIT MASIGI 1 & JALAN KEMUNING) ---
const checkBtn = document.getElementById('check-btn');
const areaInput = document.getElementById('area-input');
const coverageResult = document.getElementById('coverage-result');

checkBtn.addEventListener('click', () => {
    const rawVal = areaInput.value.trim().toLowerCase();
    
    if(!rawVal) {
        coverageResult.textContent = 'Silakan masukkan nama area atau jalan terlebih dahulu!';
        coverageResult.className = 'coverage-feedback error';
        coverageResult.classList.remove('hidden');
        return;
    }

    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa...';
    
    setTimeout(() => {
        checkBtn.innerHTML = '<span>Cek Area</span> <i class="fa-solid fa-magnifying-glass"></i>';
        
        const isParitMasigi = rawVal.includes('parit masigi') || rawVal.includes('masigi');
        const isJalanKemuning = rawVal.includes('kemuning');

        if(isParitMasigi || isJalanKemuning) {
            let areaName = isParitMasigi ? 'Parit Masigi 1' : 'Jalan Kemuning';
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Selamat! Jaringan Fiber Optic Aura.Net aktif di wilayah <b>${areaName}</b>. Silakan lanjutkan pendaftaran via WhatsApp.`;
            coverageResult.className = 'coverage-feedback success';
        } else {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Mohon maaf, area <b>${areaInput.value}</b> belum tercover jaringan kami. Coverage aktif saat ini khusus untuk wilayah <strong>Parit Masigi 1</strong> dan <strong>Jalan Kemuning</strong>.`;
            coverageResult.className = 'coverage-feedback error';
        }
        coverageResult.classList.remove('hidden');
    }, 1000);
});
