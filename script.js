// --- DYNAMIC THEME SYSTEM (LIGHT/DARK) ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');

const activeTheme = localStorage.getItem('auranet_theme') || 'dark';
htmlElement.setAttribute('data-theme', activeTheme);
updateThemeIconUI(activeTheme);

themeToggleBtn.addEventListener('click', () => {
    let current = htmlElement.getAttribute('data-theme');
    let targetTheme = current === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('auranet_theme', targetTheme);
    updateThemeIconUI(targetTheme);
});

function updateThemeIconUI(theme) {
    if(theme === 'dark') {
        themeIcon.className = 'fa-solid fa-sun-bright';
    } else {
        themeIcon.className = 'fa-solid fa-moon';
    }
}

// --- RIPPLE ANIMATION EFFECT ON BUTTONS ---
const interactiveButtons = document.querySelectorAll('.ripple-btn');

interactiveButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        let xCoord = e.clientX - e.target.getBoundingClientRect().left;
        let yCoord = e.clientY - e.target.getBoundingClientRect().top;

        let rippleCircle = document.createElement('span');
        rippleCircle.classList.add('ripple');
        rippleCircle.style.left = xCoord + 'px';
        rippleCircle.style.top = yCoord + 'px';
        this.appendChild(rippleCircle);

        setTimeout(() => {
            rippleCircle.remove();
        }, 600);
    });
});

// --- COVERAGE CHECK SIMULATOR ENGINE ---
const checkBtn = document.getElementById('check-btn');
const areaInput = document.getElementById('area-input');
const coverageResult = document.getElementById('coverage-result');

checkBtn.addEventListener('click', () => {
    const queryArea = areaInput.value.trim().toLowerCase();
    
    if(!queryArea) {
        coverageResult.textContent = 'Masukkan nama jalan atau wilayah area terlebih dahulu!';
        coverageResult.className = 'coverage-alert error';
        return;
    }

    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    
    setTimeout(() => {
        checkBtn.innerHTML = '<span>Verifikasi</span> <i class="fa-solid fa-magnifying-glass"></i>';
        
        const validKeywords = ['pontianak', 'perumahan', 'jalan', 'komplek', 'tanjung', 'sui', 'sungai', 'purnama', 'setiabudi', 'Aura'];
        let isAvailable = validKeywords.some(kw => queryArea.includes(kw)) || queryArea.length > 3;

        if(isAvailable) {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Node Fiber Optic aktif! Jaringan Aura.Net terdeteksi di wilayah <b>${areaInput.value}</b>. Silakan lanjutkan registrasi via WhatsApp.`;
            coverageResult.className = 'coverage-alert success';
        } else {
            coverageResult.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Area <b>${areaInput.value}</b> belum terhubung langsung. Hubungi tim engineering kami untuk survey ekspansi jaringan khusus.`;
            coverageResult.className = 'coverage-alert error';
        }
    }, 1200);
});
        
