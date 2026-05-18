/**
 * Reviews System
 * إدارة تقييمات المنتجات والآراء
 */

class ReviewsManager {
    constructor() {
        this.productId = null;
        this.initEventListeners();
        this.loadInitialReviews();
    }

    loadInitialReviews() {
        const form = document.getElementById('review-form');
        if (form) {
            this.productId = form.dataset.productId;
            if (this.productId) {
                this.loadReviews(this.productId);
            }
        }
    }

    initEventListeners() {
        // حفظ التقييم
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'review-form') {
                this.submitReview(e);
            }
        });

        // تصفية التقييمات
        document.addEventListener('change', (e) => {
            if (e.target.name === 'rating-filter') {
                this.filterReviews(e.target.value);
            }
        });
    }

    async submitReview(e) {
        e.preventDefault();
        
        const form = e.target;
        const productId = form.dataset.productId;
        const rating = form.querySelector('input[name="rating"]:checked').value;
        const title = form.querySelector('input[name="review_title"]').value;
        const content = form.querySelector('textarea[name="review_content"]').value;
        const name = form.querySelector('input[name="reviewer_name"]').value;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    rating: parseInt(rating),
                    title,
                    content,
                    name
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('شكراً لتقييمك! 🙏', 'success');
                form.reset();
                this.loadReviews(productId);
            } else {
                this.showNotification(data.error || 'خطأ', 'error');
            }
        } catch (error) {
            this.showNotification('خطأ في الإرسال', 'error');
        }
    }

    async loadReviews(productId) {
        try {
            const response = await fetch(`/api/reviews?product_id=${productId}`);
            const data = await response.json();
            this.displayReviews(data.reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    displayReviews(reviews) {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        const html = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div>
                        <strong>${review.name}</strong>
                        <div class="review-rating">
                            ${'⭐'.repeat(review.rating)}
                        </div>
                    </div>
                    <small>${this.formatDate(review.created_at)}</small>
                </div>
                <h4>${review.title}</h4>
                <p>${review.content}</p>
                <div class="review-helpful">
                    <button class="btn-small" data-review-id="${review.id}" data-helpful="yes">
                        👍 مفيد (${review.helpful_count || 0})
                    </button>
                    <button class="btn-small" data-review-id="${review.id}" data-helpful="no">
                        👎 غير مفيد
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<p class="empty">لا توجد تقييمات بعد</p>';
    }

    filterReviews(rating) {
        const reviews = document.querySelectorAll('.review-item');
        reviews.forEach(review => {
            if (rating === 'all') {
                review.style.display = 'block';
            } else {
                const stars = review.querySelector('.review-rating').textContent.length;
                review.style.display = stars === parseInt(rating) ? 'block' : 'none';
            }
        });
    }

    formatDate(date) {
        const d = new Date(date);
        return new Intl.DateTimeFormat('ar-EG').format(d);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsManager();
});
