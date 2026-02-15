const ProductManager = {
    allProducts: [],
    bsModal: null,

    init: function () {
        const modalEl = document.getElementById('productModal');
        if (modalEl) this.bsModal = new bootstrap.Modal(modalEl);

        this.loadProducts();
        this.attachEvents();
    },

    loadProducts: function () {
        fetch('/Products/GetProductsData', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(res => {
                this.allProducts = res.products || [];
                this.renderTable(this.allProducts);
                this.updateStats(res.stats);
            })
            .catch(err => console.error("Yükleme hatası:", err));
    },

    updateStats: function (s) {
        if (!s) return;
        const updateEl = (key, value) => {
            const container = document.querySelector(`[ws-stat="${key}"]`);
            if (container) {
                const valEl = container.querySelector('.ws-stat-value');
                if (valEl) valEl.innerText = value;
            }
        };
        updateEl('totalProducts', s.totalProducts);
        updateEl('criticalStock', s.criticalStockCount);
        updateEl('categoryCount', s.categoryCount);
        updateEl('inventoryValue', (s.totalInventoryValue || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }));
    },

    renderTable: function (list) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = list.length === 0
            ? '<tr><td colspan="7" class="text-center py-4 text-muted">Ürün bulunamadı.</td></tr>'
            : list.map(p => `
                <tr>
                    <td class="ps-4"><span class="badge bg-light text-dark border">${p.productCode}</span></td>
                    <td><strong>${p.name}</strong><br><small class="text-muted">${p.supplierName || ''}</small></td>
                    <td>${p.categoryName}</td>
                    <td>${p.countryName || '-'}</td>
                    <td>₺${(p.price || 0).toLocaleString('tr-TR')}</td>
                    <td><span class="badge ${p.stockQuantity < 10 ? 'bg-danger' : 'bg-success'}">${p.stockQuantity}</span></td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary" onclick="ProductManager.edit('${p.id}')">Düzenle</button>
                    </td>
                </tr>
            `).join('');

        if (window.lucide) lucide.createIcons();
    },

    attachEvents: function () {
        // Arama
        document.getElementById('inventorySearch')?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            this.renderTable(this.allProducts.filter(x =>
                x.name.toLowerCase().includes(term) || x.productCode.toLowerCase().includes(term)
            ));
        });

        // Yeni Ürün Modalını Açma
        document.getElementById('btnCreateNew')?.addEventListener('click', () => {
            this.openModal('/Products/Create');
        });
    },

    openModal: function (url) {
        const modalBody = document.getElementById('productModalBody');
        if (!modalBody || !this.bsModal) return;

        modalBody.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary"></div></div>';
        this.bsModal.show();

        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.text())
            .then(html => {
                modalBody.innerHTML = html;
                if (window.lucide) lucide.createIcons();
                this.bindForm();
            })
            .catch(() => modalBody.innerHTML = '<div class="alert alert-danger m-3">Form yüklenemedi.</div>');
    },

    bindForm: function () {
        const form = document.querySelector('#productModalBody form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        this.bsModal.hide();
                        this.loadProducts();
                    } else {
                        alert("Hata: " + (res.message || "Lütfen formu kontrol edin."));
                    }
                })
                .catch(() => alert("Teknik bir hata oluştu."));
        });
    },

    edit: function (id) {
        this.openModal(`/Products/Edit/${id}`);
    }
};

document.addEventListener('DOMContentLoaded', () => ProductManager.init());