/**
 * Coupon & Promo Code System
 * تطبيق وإدارة كوابين الخصم
 */

class CouponManager {
    constructor() {
        this.appliedCoupon = null;
        this.init();
    }

    init() {
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => this.applyCoupon());
        }

        const couponInput = document.getElementById('coupon-code');
        if (couponInput) {
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.applyCoupon();
            });
        }

        // تحميل الكوبونات المحفوظة
        this.loadAppliedCoupon();
    }

    async applyCoupon() {
        const couponInput = document.getElementById('coupon-code');
        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            this.showMessage('أدخل رمز الكوبون', 'error');
            return;
        }

        try {
            const response = await fetch('/api/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (data.valid) {
                this.appliedCoupon = data.coupon;
                this.saveAppliedCoupon();
                this.displayCouponSuccess(data.coupon);
                this.updateCartTotal(data.coupon);
                couponInput.value = '';
            } else {
                this.showMessage(data.message || 'كوبون غير صحيح', 'error');
            }
        } catch (error) {
            this.showMessage('خطأ في التحقق من الكوبون', 'error');
        }
    }

    displayCouponSuccess(coupon) {
        const container = document.getElementById('applied-coupon-display');
        if (!container) return;

        let discountText = '';
        if (coupon.discount_type === 'percentage') {
            discountText = `${coupon.discount_value}%`;
        } else {
            discountText = `${coupon.discount_value} د.أ`;
        }

        container.innerHTML = `
            <div class="coupon-badge success">
                <div class="coupon-info">
                    <strong>${coupon.name}</strong>
                    <p>خصم: ${discountText}</p>
                </div>
                <button type="button" class="btn-remove-coupon" onclick="couponManager.removeCoupon()">×</button>
            </div>
        `;
        this.showMessage(`تم تطبيق الكوبون: ${coupon.name}! 🎉`, 'success');
    }

    updateCartTotal(coupon) {
        const subtotalEl = document.querySelector('[data-cart-subtotal]');
        const totalEl = document.querySelector('[data-cart-total]');

        if (!subtotalEl || !totalEl) return;

        const subtotal = parseFloat(subtotalEl.textContent);
        let discount = 0;

        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }

        const newTotal = subtotal - discount;

        // إضافة صف الخصم
        const discountRow = document.createElement('div');
        discountRow.className = 'cart-discount-row';
        discountRow.innerHTML = `
            <span>الخصم (${coupon.code})</span>
            <strong class="discount-amount">-${discount.toFixed(2)} د.أ</strong>
        `;
        totalEl.parentElement.insertBefore(discountRow, totalEl);

        // تحديث الإجمالي
        totalEl.textContent = newTotal.toFixed(2) + ' د.أ';
    }

    removeCoupon() {
        this.appliedCoupon = null;
        localStorage.removeItem('barka_applied_coupon');
        document.getElementById('applied-coupon-display').innerHTML = '';
        this.showMessage('تم إزالة الكوبون', 'info');
        location.reload(); // إعادة تحميل لتحديث الإجمالي
    }

    saveAppliedCoupon() {
        localStorage.setItem('barka_applied_coupon', JSON.stringify(this.appliedCoupon));
    }

    loadAppliedCoupon() {
        const saved = localStorage.getItem('barka_applied_coupon');
        if (saved) {
            this.appliedCoupon = JSON.parse(saved);
            // يمكن هنا إعادة عرض الكوبون
        }
    }

    showMessage(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${
                type === 'success' ? '#4CAF50' : 
                type === 'error' ? '#f44336' : 
                '#2196F3'
            };
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

// Initialize globally
let couponManager;
document.addEventListener('DOMContentLoaded', () => {
    couponManager = new CouponManager();
});
