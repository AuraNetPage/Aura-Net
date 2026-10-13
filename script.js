// --- THEME TOGGLE (LIGHT / DARK) ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector('i');

const currentTheme = localStorage.getItem('auranet_theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggleBtn.addEventListener('click', () => {
    let theme = htmlElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('auranet_theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if(theme === 'dark') {
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        themeIcon.className = 'fa-solid fa-moon';
    }
}

// --- RIPPLE EFFECT ON BUTTON CLICK ---
const buttons = document.querySelectorAll('.ripple-btn');

buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        let x = e.clientX - e.target.getBoundingClientRect().left;
        let y = e.clientY - e.target.getBoundingClientRect().top;

        let ripples = document.createElement('span');
        ripples.classList.add('ripple');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        this.appendChild(ripples);

        setTimeout(() => {
            ripples.remove();
        }, 600);
    });
});

// --- COVERAGE CHECK SIMULATOR ---
const checkBtn = document.getElementById('check-btn');
const areaInput = document.getElementById('area-input');
const coverageResult = document.getElementById('coverage-result');

checkBtn.addEventListener('click', () => {
    const areaVal = areaInput.value.trim().toLowerCase();
    
    if(!areaVal) {
        coverageResult.textContent = 'Silakan masukkan nama wilayah/jalan terlebih dahulu!';
        coverageResult.className = 'coverage-result error';
        return;
    }

    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...';
    
    setTimeout(() => {
        checkBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cek';
        
        const availableAreas = ['pontianak', 'perumahan', 'jalan', 'kota', 'komplek', 'tanjung', 'sui', 'sungai'];
        let isCovered = availableAreas.some(keyword => areaVal.includes(keyword)) || areaVal.length > 3;

        if(isCovered) {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Selamat! Jaringan Fiber Optic Aura.Net sudah tersedia di wilayah <b>${areaInput.value}</b>. Silakan hubungi WhatsApp untuk registrasi.`;
            coverageResult.className = 'coverage-result success';
        } else {
            coverageResult.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Mohon maaf, area <b>${areaInput.value}</b> belum tercover penuh. Hubungi tim kami untuk survey perluasan jaringan khusus.`;
            coverageResult.className = 'coverage-result error';
        }
    }, 1000);
});
            
