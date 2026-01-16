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
    
    // Telefon numarası formatlama
    const phoneInput = document.getElementById('registerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length <= 8) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                } else {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 8) + ' ' + value.slice(8, 10);
                }
                e.target.value = value;
            }
        });
    }
    
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
    
    // Dropdown kontrolü - mouse hareket ettirdiğinde kapanmasın
    const dropdowns = document.querySelectorAll('.account-dropdown, .favorites-dropdown, .cart-dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        if (dropdownContent) {
            let isHovering = false;
            
            dropdown.addEventListener('mouseenter', function() {
                isHovering = true;
                dropdownContent.style.display = 'block';
            });
            
            dropdown.addEventListener('mouseleave', function() {
                isHovering = false;
                setTimeout(() => {
                    if (!isHovering) {
                        dropdownContent.style.display = 'none';
                    }
                }, 100);
            });
            
            dropdownContent.addEventListener('mouseenter', function() {
                isHovering = true;
            });
            
            dropdownContent.addEventListener('mouseleave', function() {
                isHovering = false;
                setTimeout(() => {
                    if (!isHovering) {
                        dropdownContent.style.display = 'none';
                    }
                }, 100);
            });
        }
    });
    
    // Şifremi Unuttum
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
        });
    }
    
    // Sosyal medya girişi
    document.querySelectorAll('.social-login-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification("Google ile giriş özelliği yakında eklenecek!");
        });
    });
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
        document.querySelector('.auth-tab:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.auth-tab:last-child').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
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
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    // Hata temizle
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginEmail').classList.remove('error');
    document.getElementById('loginPassword').classList.remove('error');
    
    // Validasyon
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'E-posta adresi gerekli';
        document.getElementById('loginEmail').classList.add('error');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('loginEmailError').textContent = 'Geçerli bir e-posta adresi girin';
        document.getElementById('loginEmail').classList.add('error');
        return;
    }
    
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Şifre gerekli';
        document.getElementById('loginPassword').classList.add('error');
        return;
    }
    
    // Kullanıcı kontrolü
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        document.getElementById('loginPasswordError').textContent = 'E-posta veya şifre hatalı';
        document.getElementById('loginPassword').classList.add('error');
        document.getElementById('loginEmail').classList.add('error');
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
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value.trim();
    const acceptTerms = document.getElementById('acceptTerms')?.checked;
    
    // Hataları temizle
    document.querySelectorAll('#registerForm .form-error').forEach(err => err.textContent = '');
    document.querySelectorAll('#registerForm input').forEach(inp => inp.classList.remove('error'));
    
    let hasError = false;
    
    // Validasyon
    if (!name || name.length < 3) {
        document.getElementById('registerNameError').textContent = 'Ad Soyad en az 3 karakter olmalı';
        document.getElementById('registerName').classList.add('error');
        hasError = true;
    }
    
    if (!email) {
        document.getElementById('registerEmailError').textContent = 'E-posta adresi gerekli';
        document.getElementById('registerEmail').classList.add('error');
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('registerEmailError').textContent = 'Geçerli bir e-posta adresi girin';
        document.getElementById('registerEmail').classList.add('error');
        hasError = true;
    } else if (users.find(u => u.email === email)) {
        document.getElementById('registerEmailError').textContent = 'Bu e-posta adresi zaten kayıtlı';
        document.getElementById('registerEmail').classList.add('error');
        hasError = true;
    }
    
    if (!password || password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Şifre en az 6 karakter olmalı';
        document.getElementById('registerPassword').classList.add('error');
        hasError = true;
    }
    
    if (!phone || !/^5\d{9}$/.test(phone.replace(/\D/g, ''))) {
        document.getElementById('registerPhoneError').textContent = 'Geçerli bir telefon numarası girin (5XX XXX XX XX)';
        document.getElementById('registerPhone').classList.add('error');
        hasError = true;
    }
    
    if (!acceptTerms) {
        document.getElementById('termsError').textContent = 'Kullanım koşullarını kabul etmelisiniz';
        hasError = true;
    }
    
    if (hasError) return;
    
    // Yeni kullanıcı oluştur
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

// Ürün Detay Modal
function openProductModal(card) {
    const cardDetails = card.closest('.elite-card').querySelector('.card-details');
    const cardImage = card.closest('.elite-card').querySelector('.card-image');
    
    const productName = cardDetails.querySelector('.p-name')?.textContent || 'Ürün';
    const productBrand = cardDetails.querySelector('.p-brand')?.textContent || 'Marka';
    const productPrice = cardDetails.querySelector('.current-p')?.textContent || '0 TL';
    const productRating = cardDetails.querySelector('.p-rating')?.textContent || '⭐ 4.5';
    const productImage = cardImage.querySelector('img')?.src || '';
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <button class="product-modal-close" onclick="this.closest('.product-modal').remove()">&times;</button>
            <div class="product-modal-body">
                <div class="product-modal-image">
                    <img src="${productImage}" alt="${productName}">
                </div>
                <div class="product-modal-info">
                    <span class="modal-brand">${productBrand}</span>
                    <h2>${productName}</h2>
                    <div class="modal-rating">${productRating}</div>
                    <div class="modal-price">${productPrice}</div>
                    <div class="modal-description">
                        <h3>Ürün Özellikleri</h3>
                        <ul>
                            <li>Premium kalite malzeme</li>
                            <li>Uzun ürün ömrü</li>
                            <li>Garantili ürün</li>
                            <li>Hızlı teslimat</li>
                            <li>Geri iade garantisi</li>
                        </ul>
                    </div>
                    <div class="modal-quantity">
                        <label>Miktar:</label>
                        <div class="quantity-selector">
                            <button onclick="decrementQty(this)">-</button>
                            <input type="number" value="1" min="1" max="10" class="qty-input">
                            <button onclick="incrementQty(this)">+</button>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-add-cart" onclick="addFromModal(this)">Sepete Ekle</button>
                        <button class="modal-add-favorite" onclick="addFavoriteFromModal(this)"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    }
}

function incrementQty(btn) {
    const input = btn.nextElementSibling;
    input.value = Math.min(10, parseInt(input.value) + 1);
}

function decrementQty(btn) {
    const input = btn.nextElementSibling;
    input.value = Math.max(1, parseInt(input.value) - 1);
}

function addFromModal(btn) {
    const modal = btn.closest('.product-modal-content');
    const productName = modal.querySelector('h2').textContent;
    const productPrice = modal.querySelector('.modal-price').textContent;
    const qty = parseInt(modal.querySelector('.qty-input').value) || 1;
    const priceNum = parseInt(productPrice.replace(/[^\d]/g, '')) || 0;
    
    for (let i = 0; i < qty; i++) {
        const productInfo = {
            id: productName.replace(/\s+/g, '-').toLowerCase(),
            name: productName,
            brand: modal.querySelector('.modal-brand').textContent,
            price: priceNum,
            priceText: productPrice,
            bgColor: '#e2e8f0'
        };
        addToCart(productInfo);
    }
    
    modal.closest('.product-modal').remove();
}

function addFavoriteFromModal(btn) {
    const modal = btn.closest('.product-modal-content');
    const productName = modal.querySelector('h2').textContent;
    const productPrice = modal.querySelector('.modal-price').textContent;
    const priceNum = parseInt(productPrice.replace(/[^\d]/g, '')) || 0;
    
    const productInfo = {
        id: productName.replace(/\s+/g, '-').toLowerCase(),
        name: productName,
        brand: modal.querySelector('.modal-brand').textContent,
        price: priceNum,
        priceText: productPrice,
        bgColor: '#e2e8f0'
    };
    
    toggleFavorite(productInfo);
    btn.classList.toggle('added');
}

// ===================== CONTACT FORM FUNCTIONS =====================

// Contact formu aç
function openContactForm() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Contact formu kapat
function closeContactForm() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Contact form gönder
function sendContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Form verilerini oku (form yapısına göre güncelle)
    const inputs = form.querySelectorAll('input, select, textarea');
    const data = {
        name: inputs[0]?.value || '',
        email: inputs[1]?.value || '',
        phone: inputs[2]?.value || '',
        subject: inputs[3]?.value || '',
        message: inputs[4]?.value || '',
        timestamp: new Date().toLocaleString('tr-TR')
    };
    
    // Mesajı localStorage'a kaydet (gerçek uygulamada backend'e gönderilirdi)
    let messages = JSON.parse(localStorage.getItem('contact-messages')) || [];
    messages.push(data);
    localStorage.setItem('contact-messages', JSON.stringify(messages));
    
    // Başarı mesajı göster
    showNotification('Mesajınız başarıyla gönderildi! En kısa zamanda sizinle iletişime geçeceğiz.');
    
    // Formu sıfırla
    form.reset();
    
    // Modalı kapat
    setTimeout(() => {
        closeContactForm();
    }, 1500);
}

// Newsletter abone ol
function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email');
    if (!email) return;
    
    const emailValue = email.value.trim();
    
    if (!emailValue) {
        showNotification('Lütfen e-posta adresinizi girin');
        return;
    }
    
    if (!validateEmail(emailValue)) {
        showNotification('Geçerli bir e-posta adresi girin');
        return;
    }
    
    // Subscribe verilerini kaydet
    let subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers')) || [];
    if (!subscribers.includes(emailValue)) {
        subscribers.push(emailValue);
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
    }
    
    showNotification('Bültene başarıyla abone oldunuz!');
    email.value = '';
}

// E-posta doğrulama
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modal dışına tıklanınca kapat
document.addEventListener('click', function(event) {
    const contactModal = document.getElementById('contact-modal');
    if (event.target === contactModal) {
        closeContactForm();
    }
});

// Page load olduğunda başlat
window.addEventListener('load', function() {
    loadFromStorage();
    
    // Contact link dinleyicisi ekle (footer linki için)
    const contactLinks = document.querySelectorAll('a[href="#iletisim"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openContactForm();
        });
    });
});
