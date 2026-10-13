// --- THEME SWITCHER (DARK / LIGHT) ---
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const currentTheme = localStorage.getItem('auranet_theme') || 'dark';
htmlEl.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    let active = htmlEl.getAttribute('data-theme');
    let next = active === 'dark' ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('auranet_theme', next);
});

// --- COVERAGE CHECKER LOGIC ---
const checkBtn = document.getElementById('check-btn');
const areaInput = document.getElementById('area-input');
const coverageResult = document.getElementById('coverage-result');

checkBtn.addEventListener('click', () => {
    const val = areaInput.value.trim().toLowerCase();
    
    if(!val) {
        coverageResult.textContent = 'Silakan masukkan nama jalan atau wilayah Anda terlebih dahulu!';
        coverageResult.className = 'coverage-msg error';
        return;
    }

    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
    
    setTimeout(() => {
        checkBtn.textContent = 'Verifikasi Area';
        
        const validAreas = ['pontianak', 'perumahan', 'jalan', 'komplek', 'tanjung', 'sui', 'sungai', 'purnama', 'aura'];
        let matched = validAreas.some(k => val.includes(k)) || val.length > 3;

        if(matched) {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Jaringan Fiber Optic aktif! Area <b>${areaInput.value}</b> tercover sistem Aura.Net.`;
            coverageResult.className = 'coverage-msg success';
        } else {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Mohon maaf, area <b>${areaInput.value}</b> belum terjangkau. Hubungi WhatsApp untuk survey perluasan.`;
            coverageResult.className = 'coverage-msg error';
        }
    }, 1000);
});
