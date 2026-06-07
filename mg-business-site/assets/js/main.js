/* ============================================
   MG BUSINESS - JAVASCRIPT PRINCIPAL
   Optimisé pour la fluidité et performance
   ============================================ */

// Configuration globale
const CONFIG = {
    currency: 'FC',
    exchangeRate: 2500, // 1 USD = 2500 FC
    cartKey: 'mg_business_cart',
    currencyKey: 'mg_business_currency'
};

// Produits de démonstration
const PRODUCTS = [
    {
        id: 1,
        name: 'Parfum Luxe Premium',
        category: 'parfums',
        price: 150,
        image: 'assets/images/xne2WKeFNwMe.jpg',
        rating: 5,
        description: 'Fragrance exquise de luxe'
    },
    {
        id: 2,
        name: 'Collier Diamant',
        category: 'bijoux',
        price: 500,
        image: 'assets/images/mC6GW8KYDxlI.png',
        rating: 5,
        description: 'Bijou élégant et raffiné'
    },
    {
        id: 3,
        name: 'Montre Prestige',
        category: 'montres',
        price: 800,
        image: 'assets/images/aSwlJB7l0pEe.jpg',
        rating: 5,
        description: 'Timepiece de luxe'
    },
    {
        id: 4,
        name: 'Robe Fille Élégante',
        category: 'vetements',
        price: 120,
        image: 'assets/images/fGLIDb06eG3j.jpg',
        rating: 4,
        description: 'Vêtement premium pour fille'
    },
    {
        id: 5,
        name: 'Accessoire Mode',
        category: 'accessoires',
        price: 80,
        image: 'assets/images/x1uxuBTx2TmC.jpeg',
        rating: 4,
        description: 'Accessoire de mode tendance'
    },
    {
        id: 6,
        name: 'Parfum Fleuri',
        category: 'parfums',
        price: 180,
        image: 'assets/images/Ls3OwsaCuVz2.jpg',
        rating: 5,
        description: 'Parfum floral délicat'
    },
    {
        id: 7,
        name: 'Bracelet Or',
        category: 'bijoux',
        price: 350,
        image: 'assets/images/nnBT3olJzrap.jpg',
        rating: 5,
        description: 'Bracelet en or massif'
    },
    {
        id: 8,
        name: 'Montre Classique',
        category: 'montres',
        price: 600,
        image: 'assets/images/TkLAzhbzxXdj.jpg',
        rating: 4,
        description: 'Montre classique intemporelle'
    }
];

// ============================================
// GESTION DU PANIER
// ============================================

class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem(CONFIG.cartKey);
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem(CONFIG.cartKey, JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} ajouté au panier!`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--secondary-color);
            color: var(--primary-color);
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            animation: slideInLeft 0.3s ease-out;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    clear() {
        this.items = [];
        this.saveCart();
    }
}

// Initialiser le panier global
const cart = new Cart();

// ============================================
// GESTION DE LA DEVISE
// ============================================

class CurrencyManager {
    constructor() {
        this.currency = this.loadCurrency();
        this.initCurrencySelector();
    }

    loadCurrency() {
        return localStorage.getItem(CONFIG.currencyKey) || 'FC';
    }

    saveCurrency(currency) {
        localStorage.setItem(CONFIG.currencyKey, currency);
        this.currency = currency;
    }

    convertPrice(priceUSD) {
        if (this.currency === 'USD') {
            return priceUSD;
        }
        return Math.round(priceUSD * CONFIG.exchangeRate);
    }

    formatPrice(price) {
        if (this.currency === 'USD') {
            return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }
        return `${price.toLocaleString('fr-FR')} FC`;
    }

    initCurrencySelector() {
        const selector = document.getElementById('currency-selector');
        if (selector) {
            selector.value = this.currency;
            selector.addEventListener('change', (e) => {
                this.saveCurrency(e.target.value);
                this.updateAllPrices();
            });
        }
    }

    updateAllPrices() {
        const priceElements = document.querySelectorAll('[data-price]');
        priceElements.forEach(element => {
            const priceUSD = parseFloat(element.dataset.price);
            const convertedPrice = this.convertPrice(priceUSD);
            element.textContent = this.formatPrice(convertedPrice);
        });
    }
}

const currencyManager = new CurrencyManager();

// ============================================
// AFFICHAGE DES PRODUITS
// ============================================

function renderProducts(products = PRODUCTS, containerId = 'featured-products') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price" data-price="${product.price}">
                    ${currencyManager.formatPrice(currencyManager.convertPrice(product.price))}
                </p>
                <div class="product-rating">${'⭐'.repeat(product.rating)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Ajouter au Panier
                </button>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
        cart.addItem(product);
    }
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Fermer le menu au clic sur un lien
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Marquer le lien actif
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============================================
// NEWSLETTER
// ============================================

function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            localStorage.setItem('newsletter_email', email);
            cart.showNotification('Merci de votre inscription!');
            form.reset();
        });
    }
}

// ============================================
// ANIMATIONS À L'APPARITION
// ============================================

function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.product-card, .category-card, .stat-card, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les composants
    initNavigation();
    initNewsletter();
    cart.updateCartCount();
    currencyManager.updateAllPrices();

    // Afficher les produits vedettes
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        renderProducts(PRODUCTS.slice(0, 6), 'featured-products');
    }

    // Animations
    setTimeout(initIntersectionObserver, 100);

    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// ============================================
// LAZY LOADING DES IMAGES
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ============================================
// UTILITAIRES
// ============================================

// Fonction pour obtenir les paramètres d'URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
}

// Fonction pour filtrer les produits
function filterProducts(category) {
    if (category === 'all') {
        return PRODUCTS;
    }
    return PRODUCTS.filter(p => p.category === category);
}

// Fonction de recherche
function searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
}

// Export pour utilisation dans d'autres fichiers
window.cart = cart;
window.currencyManager = currencyManager;
window.renderProducts = renderProducts;
window.addToCart = addToCart;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.PRODUCTS = PRODUCTS;
