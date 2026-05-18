/**
 * Advanced Filters
 * تصفية ديناميكية بدون reload
 */

class AdvancedFilters {
    constructor() {
        this.filters = {
            priceMin: 0,
            priceMax: 100000,
            rating: 0,
            inStock: true,
            category: []
        };
        this.init();
    }

    init() {
        this.loadFilters();
        this.attachEventListeners();
    }

    loadFilters() {
        const saved = localStorage.getItem('barka_filters');
        if (saved) {
            this.filters = JSON.parse(saved);
            this.restoreFilterUI();
        }
    }

    saveFilters() {
        localStorage.setItem('barka_filters', JSON.stringify(this.filters));
    }

    attachEventListeners() {
        // نطاق السعر
        const priceRange = document.getElementById('price-range-slider');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => this.handlePriceChange(e));
        }

        // التقييم
        const ratingButtons = document.querySelectorAll('[data-rating-filter]');
        ratingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRatingFilter(e));
        });

        // التوفر
        const stockCheckbox = document.getElementById('filter-in-stock');
        if (stockCheckbox) {
            stockCheckbox.addEventListener('change', () => this.handleStockFilter());
        }

        // زر مسح المرشحات
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // زر تطبيق المرشحات
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
    }

    handlePriceChange(e) {
        const value = e.target.value;
        
        // معالجة single value أو dual values
        let min, max;
        if (value.includes(',')) {
            [min, max] = value.split(',').map(Number);
        } else {
            // إذا كان single range، استخدمه كحد أقصى والحد الأدنى = 0
            max = parseInt(value);
            min = 0;
        }
        
        this.filters.priceMin = min;
        this.filters.priceMax = max;
        
        // تحديث العرض الفوري
        const display = document.getElementById('price-display');
        if (display) {
            display.textContent = `${min} - ${max} د.أ`;
        }
        
        this.saveFilters();
    }

    handleRatingFilter(e) {
        e.target.classList.toggle('active');
        
        const selectedRatings = Array.from(
            document.querySelectorAll('[data-rating-filter].active')
        ).map(btn => parseInt(btn.dataset.rating));
        
        this.filters.rating = selectedRatings[0] || 0; // احتفظ بأول تقييم
        this.saveFilters();
    }

    handleStockFilter() {
        this.filters.inStock = document.getElementById('filter-in-stock').checked;
        this.saveFilters();
    }

    clearAllFilters() {
        this.filters = {
            priceMin: 0,
            priceMax: 100000,
            rating: 0,
            inStock: true,
            category: []
        };
        this.saveFilters();
        this.restoreFilterUI();
        this.applyFilters();
    }

    restoreFilterUI() {
        // استعادة سعر
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            priceDisplay.textContent = `${this.filters.priceMin} - ${this.filters.priceMax} د.أ`;
        }

        // استعادة التقييم
        if (this.filters.rating > 0) {
            const ratingBtn = document.querySelector(`[data-rating-filter="${this.filters.rating}"]`);
            if (ratingBtn) ratingBtn.classList.add('active');
        }

        // استعادة التوفر
        const stockCheckbox = document.getElementById('filter-in-stock');
        if (stockCheckbox) {
            stockCheckbox.checked = this.filters.inStock;
        }
    }

    async applyFilters() {
        const products = document.querySelectorAll('[data-product]');
        let visibleCount = 0;

        products.forEach(product => {
            const price = parseFloat(product.dataset.price);
            const rating = parseInt(product.dataset.rating) || 0;
            const inStock = product.dataset.stock !== '0';

            const matchPrice = price >= this.filters.priceMin && price <= this.filters.priceMax;
            const matchRating = this.filters.rating === 0 || rating >= this.filters.rating;
            const matchStock = !this.filters.inStock || inStock;

            if (matchPrice && matchRating && matchStock) {
                product.style.display = 'block';
                product.classList.add('fade-in');
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });

        // عرض رسالة إذا لم تكن هناك نتائج
        const resultCount = document.getElementById('result-count');
        if (resultCount) {
            resultCount.textContent = visibleCount === 0 
                ? 'لم يتم العثور على منتجات مطابقة' 
                : `${visibleCount} منتج`;
        }

        this.saveFilters();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedFilters();
});
