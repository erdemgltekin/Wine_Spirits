/**
 * ProductManager - Modern Inventory Management
 * Handles fetching, filtering, and dynamic rendering of products.
 */
const ProductManager = {
    data: {
        products: [],
        categories: [],
        filteredProducts: []
    },
    currentFilter: 'all',
    searchQuery: '',

    init: function () {
        console.log("ProductManager: Initializing...");
        this.loadCategories();
        this.loadProducts();
        this.attachEvents();
    },

    /**
     * Tüm kategorileri backend'den çeker ve filtre pillerini oluşturur.
     */
    loadCategories: function () {
        const self = this;
        fetch('/Products/GetCategories')
            .then(r => r.json())
            .then(data => {
                self.data.categories = data;
                self.renderFilters();
            })
            .catch(err => console.error("Kategori yükleme hatası:", err));
    },

    /**
     * Tüm ürünleri backend'den çeker.
     */
    loadProducts: function () {
        const self = this;
        this.showLoading();
        fetch('/Products/GetProductsData')
            .then(r => r.json())
            .then(data => {
                self.data.products = data;
                self.data.filteredProducts = data;
                self.renderTable();
            })
            .catch(err => console.error("Ürün yükleme hatası:", err));
    },

    /**
     * Event listener'ları bağlar (Arama çubuğu).
     */
    attachEvents: function () {
        const self = this;
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                self.searchQuery = e.target.value.toLowerCase();
                self.applyFilters();
            });
        }
    },

    /**
     * Kategori filtre pillerini render eder.
     */
    renderFilters: function () {
        const container = document.getElementById('filterPillsContainer');
        if (!container) return;

        let html = `<div class="filter-pill active" data-category="all">Tümü</div>`;
        this.data.categories.forEach(cat => {
            html += `<div class="filter-pill" data-category="${cat.id}">${cat.name}</div>`;
        });
        container.innerHTML = html;

        // Pill tıklama olayı
        container.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const catId = pill.getAttribute('data-category');

                // Stil güncelleme
                container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                this.currentFilter = catId;
                this.applyFilters();
            });
        });
    },

    /**
     * Arama ve kategori filtrelerini uygular.
     */
    applyFilters: function () {
        this.data.filteredProducts = this.data.products.filter(p => {
            const matchesCategory = this.currentFilter === 'all' || p.categoryId === this.currentFilter;
            const matchesSearch = p.name.toLowerCase().includes(this.searchQuery) ||
                p.supplierName.toLowerCase().includes(this.searchQuery);
            return matchesCategory && matchesSearch;
        });
        this.renderTable();
    },

    /**
     * Ürün tablosunu dinamik olarak render eder.
     */
    renderTable: function () {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (this.data.filteredProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">Arama kriterlerine uygun ürün bulunamadı.</td></tr>`;
            return;
        }

        let html = '';
        this.data.filteredProducts.forEach(p => {
            const stockClass = p.stockQuantity < 10 ? 'low' : 'normal';
            const priceFormatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.price);

            html += `
                <tr>
                    <td>
                        <div class="product-info-cell">
                            <span class="product-name">${this.esc(p.name)}</span>
                            <span class="product-meta">${this.esc(p.supplierName)} • ${p.year}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-light text-indigo border fw-normal" style="color: #6366f1;">${this.esc(p.categoryName)}</span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center text-muted small">
                            <i data-lucide="globe" class="me-1" style="width:14px;"></i>
                            ${this.esc(p.countryName)}
                        </div>
                    </td>
                    <td class="fw-bold text-dark">${priceFormatted}</td>
                    <td>
                        <span class="badge-stock ${stockClass}">
                            ${p.stockQuantity} ${this.esc(p.unitName)}
                        </span>
                    </td>
                    <td>
                        <div class="action-group">
                            <a href="/Products/Edit/${p.id}" class="action-btn-v2" title="Düzenle">
                                <i data-lucide="pencil" style="width:16px;"></i>
                            </a>
                            <a href="/Products/Delete/${p.id}" class="action-btn-v2 delete" title="Sil">
                                <i data-lucide="trash-2" style="width:16px;"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    showLoading: function () {
        const tbody = document.getElementById('productsTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>`;
    },

    esc: function (t) {
        if (!t) return "-";
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => ProductManager.init());
