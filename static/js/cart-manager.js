/**
 * Cart Management with AJAX
 * - تحديث الكمية فوراً بدون reload
 * - حفظ السلة في localStorage
 * - عرض الإشعارات
 */

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.wishlist = this.loadWishlist();
        this.initEventListeners();
    }

    loadCart() {
        const stored = localStorage.getItem('barka_cart');
        return stored ? JSON.parse(stored) : {};
    }

    saveCart() {
        localStorage.setItem('barka_cart', JSON.stringify(this.cart));
        this.updateCartCounter();
    }

    loadWishlist() {
        const stored = localStorage.getItem('barka_wishlist');
        return stored ? JSON.parse(stored) : [];
    }

    saveWishlist() {
        localStorage.setItem('barka_wishlist', JSON.stringify(this.wishlist));
    }

    // تحديث كمية المنتج عبر AJAX
    updateQuantity(productId, quantity) {
        return fetch('/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity)
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                this.showNotification('تم تحديث السلة', 'success');
                this.cart[productId] = quantity;
                this.saveCart();
                return data;
            } else {
                this.showNotification(data.error || 'خطأ في التحديث', 'error');
                return null;
            }
        });
    }

    // إضافة المنتج إلى wishlist
    toggleWishlist(productId, productName) {
        const index = this.wishlist.indexOf(productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showNotification(`تم إزالة ${productName} من المفضلة`, 'info');
        } else {
            this.wishlist.push(productId);
            this.showNotification(`تم إضافة ${productName} إلى المفضلة ❤️`, 'success');
        }
        this.saveWishlist();
        this.updateWishlistUI(productId);
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    updateWishlistUI(productId) {
        const btn = document.querySelector(`[data-wishlist-btn="${productId}"]`);
        if (btn) {
            if (this.isInWishlist(productId)) {
                btn.classList.add('is-active');
                btn.innerHTML = '❤️ أزل من المفضلة';
            } else {
                btn.classList.remove('is-active');
                btn.innerHTML = '🤍 أضف إلى المفضلة';
            }
        }
    }

    // عرض الإشعارات
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // تحديث عدادة السلة
    updateCartCounter() {
        const counter = document.querySelector('.nav-counter');
        if (counter) {
            const count = Object.values(this.cart).reduce((a, b) => a + b, 0);
            counter.textContent = count;
        }
    }

    initEventListeners() {
        // تحديث الكمية
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const form = e.target.closest('form');
                const productId = form.dataset.productId;
                const quantity = e.target.value;
                this.updateQuantity(productId, quantity);
            }
        });

        // زر المفضلة
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-wishlist-btn')) {
                const productId = e.target.getAttribute('data-wishlist-btn');
                const productName = e.target.getAttribute('data-product-name');
                this.toggleWishlist(productId, productName);
            }
        });

        // استعادة الـ wishlist عند تحميل الصفحة
        this.wishlist.forEach(productId => this.updateWishlistUI(productId));
    }
}

// Initialize on DOM ready
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});
