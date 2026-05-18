/**
 * Live Search with Autocomplete
 * بحث فوري مع اقتراحات
 */

class LiveSearch {
    constructor(inputSelector, resultsSelector) {
        this.input = document.querySelector(inputSelector);
        this.resultsContainer = document.querySelector(resultsSelector);
        this.debounceTimer = null;
        this.currentIndex = -1;
        
        if (this.input) {
            this.init();
        }
    }

    init() {
        // البحث عند الكتابة
        this.input.addEventListener('input', (e) => this.handleSearch(e));
        
        // التنقل بلوحة المفاتيح
        this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // إغلاق عند الضغط خارجاً
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-live-search]')) {
                this.closeResults();
            }
        });
    }

    handleSearch(e) {
        const query = e.target.value.trim();
        
        clearTimeout(this.debounceTimer);
        
        if (query.length < 2) {
            this.closeResults();
            return;
        }

        // تأخير البحث قليلاً لتجنب الأعباء الثقيلة
        this.debounceTimer = setTimeout(() => {
            this.search(query);
        }, 300);
    }

    search(query) {
        fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
            .then(r => r.json())
            .then(data => this.displayResults(data.products))
            .catch(() => this.showError('خطأ في البحث'));
    }

    displayResults(products) {
        if (!products || products.length === 0) {
            this.resultsContainer.innerHTML = '<div class="search-no-results">لم يتم العثور على منتجات</div>';
            return;
        }

        const html = products.map((product, index) => `
            <a href="/product/${product.slug}" class="search-result-item" data-result-index="${index}">
                <div class="search-result-image">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                </div>
                <div class="search-result-content">
                    <div class="search-result-name">${this.highlight(product.name, this.input.value)}</div>
                    <div class="search-result-price">${product.price} د.أ</div>
                    <div class="search-result-category">${product.category}</div>
                </div>
            </a>
        `).join('');

        this.resultsContainer.innerHTML = html;
        this.resultsContainer.style.display = 'block';
        this.currentIndex = -1;
    }

    highlight(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    handleKeyboard(e) {
        const items = this.resultsContainer.querySelectorAll('.search-result-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentIndex = (this.currentIndex + 1) % items.length;
            this.highlightCurrent(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentIndex = this.currentIndex - 1 < 0 ? items.length - 1 : this.currentIndex - 1;
            this.highlightCurrent(items);
        } else if (e.key === 'Enter' && this.currentIndex !== -1) {
            e.preventDefault();
            items[this.currentIndex].click();
        }
    }

    highlightCurrent(items) {
        items.forEach((item, index) => {
            if (index === this.currentIndex) {
                item.classList.add('is-highlighted');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('is-highlighted');
            }
        });
    }

    showError(message) {
        this.resultsContainer.innerHTML = `<div class="search-error">${message}</div>`;
        this.resultsContainer.style.display = 'block';
    }

    closeResults() {
        this.resultsContainer.style.display = 'none';
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new LiveSearch('#q', '#search-results');
});
