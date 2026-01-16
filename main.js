// Favoriler ve Sepet Yönetimi
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// LocalStorage'dan verileri yükle
function loadFromStorage() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateFavoritesUI();
    updateCartUI();
}

// LocalStorage'a kaydet
function saveToStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Ürün bilgilerini karttan al
function getProductInfo(card) {
    const cardDetails = card.closest('.elite-card').querySelector('.card-details');
    const brand = cardDetails.querySelector('.p-brand')?.textContent || 'BRAND';
    const name = cardDetails.querySelector('.p-name')?.textContent || 'Ürün';
    const priceText = cardDetails.querySelector('.current-p')?.textContent || '0 TL';
    const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    const image = card.closest('.elite-card').querySelector('.card-image');
    const bgColor = window.getComputedStyle(image).background || '#e2e8f0';
    
    return {
        id: `${brand}-${name}`.replace(/\s+/g, '-').toLowerCase(),
        brand,
        name,
        price,
        priceText,
        bgColor
    };
}

// Sepete ekle
function addToCart(productInfo) {
    const existingItem = cart.find(item => item.id === productInfo.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...productInfo, quantity: 1 });
    }
    saveToStorage();
    updateCartUI();
    showNotification("Ürün sepetinize eklendi!");
}

// Favorilere ekle/çıkar
function toggleFavorite(productInfo) {
    const index = favorites.findIndex(item => item.id === productInfo.id);
    if (index > -1) {
        favorites.splice(index, 1);
        showNotification("Ürün favorilerden kaldırıldı.");
    } else {
        favorites.push(productInfo);
        showNotification("Ürün favorilere eklendi!");
    }
    saveToStorage();
    updateFavoritesUI();
    updateFavoriteButtons();
}

// Favoriler UI'ını güncelle
function updateFavoritesUI() {
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.querySelector('.favorites-count');
    const favoritesDot = document.querySelector('.favorites-dot');
    
    if (!favoritesList) return;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart" style="font-size: 48px; color: var(--gray-400); margin-bottom: 15px;"></i>
                <p>Henüz favori ürününüz yok</p>
            </div>
        `;
        if (favoritesDot) favoritesDot.style.display = 'none';
        if (favoritesCount) favoritesCount.textContent = '0 Ürün';
    } else {
        favoritesList.innerHTML = favorites.map(item => `
            <div class="dropdown-item">
                <div class="dropdown-item-image" style="background: ${item.bgColor || '#e2e8f0'};"></div>
                <div class="dropdown-item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">${item.priceText}</div>
                </div>
                <button class="dropdown-item-remove" onclick="removeFromFavorites('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        if (favoritesDot) {
            favoritesDot.textContent = favorites.length;
            favoritesDot.style.display = 'flex';
        }
        if (favoritesCount) favoritesCount.textContent = `${favorites.length} Ürün`;
    }
}

// Sepet UI'ını güncelle
function updateCartUI() {
    const cartList = document.getElementById('cart-list');
    const cartCount = document.querySelector('.cart-count');
    const cartDot = document.querySelector('.cart-dot');
    const cartFooter = document.getElementById('cart-footer');
    const totalPrice = document.querySelector('.total-price');
    
    if (!cartList) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bag-shopping" style="font-size: 48px; color: var(--gray-400); margin-bottom: 15px;"></i>
                <p>Sepetiniz boş</p>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        if (cartCount) cartCount.textContent = '0 Ürün';
        if (cartDot) cartDot.textContent = '0';
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="dropdown-item">
                <div class="dropdown-item-image" style="background: ${item.bgColor || '#e2e8f0'};"></div>
                <div class="dropdown-item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">${item.priceText} ${item.quantity > 1 ? `x${item.quantity}` : ''}</div>
                </div>
                <button class="dropdown-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        if (cartFooter) cartFooter.style.display = 'block';
        if (cartCount) cartCount.textContent = `${totalItems} Ürün`;
        if (cartDot) cartDot.textContent = totalItems;
        if (totalPrice) totalPrice.textContent = `${total.toLocaleString('tr-TR')} TL`;
    }
}

// Favorilerden kaldır
function removeFromFavorites(id) {
    favorites = favorites.filter(item => item.id !== id);
    saveToStorage();
    updateFavoritesUI();
    updateFavoriteButtons();
    showNotification("Ürün favorilerden kaldırıldı.");
}

// Sepetten kaldır
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveToStorage();
    updateCartUI();
    showNotification("Ürün sepetten kaldırıldı.");
}

// Favori butonlarını güncelle
function updateFavoriteButtons() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        const card = btn.closest('.elite-card');
        const productInfo = getProductInfo(card);
        const icon = btn.querySelector('i');
        const isFavorite = favorites.some(item => item.id === productInfo.id);
        
        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#ef4444';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
        }
    });
}

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    updateAccountDropdown();
    
    // Sepete ekle butonları
    document.querySelectorAll('.add-btn-elite').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.elite-card');
            const productInfo = getProductInfo(card);
            addToCart(productInfo);
        });
    });

    // Favori butonları
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.elite-card');
            const productInfo = getProductInfo(card);
            toggleFavorite(productInfo);
        });
    });
    
    // Sepete git butonu
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            window.location.href = 'sepet.html';
        });
    }
});

// Bildirim gösterme fonksiyonu
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--electric-orange, #FF6000);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
if (!document.querySelector('style[data-notifications]')) {
    style.setAttribute('data-notifications', 'true');
    document.head.appendChild(style);
}

// Kullanıcı Yönetimi
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];

// Modal Tab Değiştirme
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        const firstTab = document.querySelector('.auth-tab:first-child');
        const loginForm = document.getElementById('loginForm');
        if (firstTab) firstTab.classList.add('active');
        if (loginForm) loginForm.classList.add('active');
    } else {
        const lastTab = document.querySelector('.auth-tab:last-child');
        const registerForm = document.getElementById('registerForm');
        if (lastTab) lastTab.classList.add('active');
        if (registerForm) registerForm.classList.add('active');
    }
    
    // Hataları temizle
    document.querySelectorAll('.form-error').forEach(err => err.textContent = '');
    document.querySelectorAll('.form-group input').forEach(inp => inp.classList.remove('error'));
}

// Modal Kontrolleri
function openModal(tab = 'login') {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "block";
        switchAuthTab(tab);
    }
}
function closeModal() { 
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
        // Formları temizle
        document.querySelectorAll('form').forEach(form => form.reset());
        document.querySelectorAll('.form-error').forEach(err => err.textContent = '');
        document.querySelectorAll('.form-group input').forEach(inp => inp.classList.remove('error'));
    }
}

// Giriş Yap
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    if (!email || !password) return;
    
    // Hata temizle
    const emailError = document.getElementById('loginEmailError');
    const passwordError = document.getElementById('loginPasswordError');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (emailInput) emailInput.classList.remove('error');
    if (passwordInput) passwordInput.classList.remove('error');
    
    // Validasyon
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (emailError) emailError.textContent = 'Geçerli bir e-posta adresi girin';
        if (emailInput) emailInput.classList.add('error');
        return;
    }
    
    // Kullanıcı kontrolü
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        if (passwordError) passwordError.textContent = 'E-posta veya şifre hatalı';
        if (emailInput) emailInput.classList.add('error');
        if (passwordInput) passwordInput.classList.add('error');
        return;
    }
    
    // Giriş başarılı
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
    }
    
    updateAccountDropdown();
    closeModal();
    showNotification(`Hoş geldiniz, ${user.name.split(' ')[0]}!`);
}

// Üye Ol
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;
    const phone = document.getElementById('registerPhone')?.value.trim();
    const acceptTerms = document.getElementById('acceptTerms')?.checked;
    
    if (!name || !email || !password || !phone || !acceptTerms) return;
    
    // Validasyon ve kullanıcı oluşturma
    if (name.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
        password.length >= 6 && /^5\d{9}$/.test(phone.replace(/\D/g, '')) && 
        !users.find(u => u.email === email)) {
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            phone: phone.replace(/\D/g, ''),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAccountDropdown();
        closeModal();
        showNotification(`Hoş geldiniz, ${name.split(' ')[0]}! Kayıt işleminiz başarıyla tamamlandı.`);
    }
}

// Çıkış Yap
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    updateAccountDropdown();
    showNotification('Başarıyla çıkış yaptınız');
}

// Hesap Dropdown'ını Güncelle
function updateAccountDropdown() {
    const accountDropdowns = document.querySelectorAll('.account-dropdown .dropdown-content');
    
    accountDropdowns.forEach(dropdown => {
        if (currentUser) {
            dropdown.innerHTML = `
                <div style="padding: 15px 20px; border-bottom: 1px solid var(--gray-100);">
                    <div style="font-weight: 700; color: var(--deep-navy); margin-bottom: 5px;">${currentUser.name}</div>
                    <div style="font-size: 12px; color: var(--gray-400);">${currentUser.email}</div>
                </div>
                <a href="account.html">Hesabım</a>
                <a href="orders.html">Siparişlerim</a>
                <a href="ai-favorites.html">AI Favorilerim</a>
                <a href="#">Favorilerim</a>
                <a href="#">Adreslerim</a>
                <hr>
                <a href="#" onclick="handleLogout(); return false;">Çıkış Yap</a>
            `;
        } else {
            dropdown.innerHTML = `
                <a href="login.html">Giriş Yap</a>
                <a href="register.html">Üye Ol</a>
                <hr>
                <a href="orders.html">Siparişlerim</a>
                <a href="ai-favorites.html">AI Favorilerim</a>
            `;
        }
    });
    
    // Icon güncelle
    const accountIcons = document.querySelectorAll('.account-dropdown i');
    accountIcons.forEach(icon => {
        if (currentUser) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

window.onclick = function(event) {
    let modal = document.getElementById("authModal");
    if (event.target == modal) closeModal();
    
    let aiModal = document.getElementById("ai-results-overlay");
    if (event.target == aiModal) {
        const resultsOverlay = document.getElementById('ai-results-overlay');
        if (resultsOverlay) resultsOverlay.style.display = 'none';
    }
}

function toggleCart() {
    showNotification("Sepetinizdeki ürünler AI tarafından analiz ediliyor...");
}

// AI Rutin Analizi Fonksiyonu
document.addEventListener('DOMContentLoaded', function() {
    const routineBtn = document.getElementById('ai-routine-btn');
    const resultsOverlay = document.getElementById('ai-results-overlay');
    const loadingDiv = document.getElementById('ai-loading');
    const reportDiv = document.getElementById('ai-report');

    if(routineBtn && resultsOverlay && loadingDiv && reportDiv) {
        routineBtn.addEventListener('click', () => {
            resultsOverlay.style.display = 'block';
            loadingDiv.style.display = 'block';
            reportDiv.style.display = 'none';

            setTimeout(() => {
                loadingDiv.style.display = 'none';
                reportDiv.style.display = 'block';
            }, 2000); 
        });
    }
});

function closeAIResults() {
    const resultsOverlay = document.getElementById('ai-results-overlay');
    if (resultsOverlay) {
        resultsOverlay.style.display = 'none';
    }
}

function addAllToCart() {
    showNotification("Analiz Edilen Tüm Ürünler Sepetinize Eklendi! AI motorumuz tercihlerinizi profilinize kaydetti.");
    closeAIResults();
}
