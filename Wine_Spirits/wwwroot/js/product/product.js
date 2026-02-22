/**
 * Product Management Module - Figma Premium Edition
 */
const ProductManager = {
    allProducts: [],
    filteredProducts: [],

    init: function () {
        this.loadProducts();
        this.attachEvents();
        this.initDatePicker();
    },

    initDatePicker: function () {
        const dateInput = document.getElementById('dateFilter');
        if (dateInput && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                locale: "tr",
                mode: "range",
                dateFormat: "d.m.Y",
                onChange: () => this.applyFilters()
            });
        }
    },

    loadProducts: function () {
        fetch('/Products/GetProductsData', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(res => {
                this.allProducts = res.products || [];
                this.filteredProducts = [...this.allProducts];
                this.populateCategories();
                this.renderTable(this.filteredProducts);
            })
            .catch(err => console.error("Veri yükleme hatası:", err));
    },

    renderTable: function (products) {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">Ürün bulunamadı.</td></tr>';
            return;
        }

        tableBody.innerHTML = products.map(p => {
            const priceStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.price || 0);
            const isCritical = p.stockQuantity <= 10;

            return `
            <tr>
                <td class="ps-4"><span class="badge bg-light text-dark border">${p.productCode}</span></td>
                <td><div class="fw-bold text-dark">${p.name}</div></td>
                <td><span class="badge bg-indigo-50 text-indigo-700">${p.categoryName || '-'}</span></td>
                <td><div class="text-muted small">${p.supplierName || '-'}</div></td>
                <td class="fw-bold text-dark">${priceStr}</td>
                <td><span class="fw-medium text-dark">${p.stockQuantity} Adet</span></td>
                <td>
                    <span class="status-pill ${isCritical ? 'status-danger' : 'status-success'}">
                        ${isCritical ? 'Kritik Stok' : 'Stokta Var'}
                    </span>
                </td>
                <td class="text-center-actions">
                    <div class="d-flex justify-content-center gap-1">
                        <button onclick="ProductManager.view('${p.id}')" class="ws-action-btn" title="Görüntüle"><i data-lucide="eye"></i></button>
                        <button onclick="ProductManager.edit('${p.id}')" class="ws-action-btn" title="Düzenle"><i data-lucide="edit-2"></i></button>
                        <button onclick="ProductManager.delete('${p.id}')" class="ws-action-btn text-danger" title="Sil"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        if (typeof GlobalUI !== 'undefined') {
            GlobalUI.refreshLucide();
        }
    },

    // Filtreleme ve Kategoriler aynı kalıyor...
    applyFilters: function () {
        const s = document.getElementById('inventorySearch')?.value.toLowerCase() || "";
        const c = document.getElementById('filterCategory')?.value || "";
        const st = document.getElementById('filterStock')?.value || "";

        this.filteredProducts = this.allProducts.filter(p => {
            const matchesSearch = (p.name || "").toLowerCase().includes(s) || (p.productCode || "").toLowerCase().includes(s);
            const matchesCat = c === "" || p.categoryName === c;
            const matchesStock = st === "" || (st === "critical" ? p.stockQuantity <= 10 : (st === "in-stock" ? p.stockQuantity > 10 : true));
            return matchesSearch && matchesCat && matchesStock;
        });
        this.renderTable(this.filteredProducts);
    },

    populateCategories: function () {
        const catSelect = document.getElementById('filterCategory');
        if (!catSelect || this.allProducts.length === 0) return;
        const cats = [...new Set(this.allProducts.map(p => p.categoryName))].filter(Boolean).sort();
        catSelect.innerHTML = '<option value="">Kategori</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    },

    attachEvents: function () {
        document.getElementById('inventorySearch')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('filterCategory')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filterStock')?.addEventListener('change', () => this.applyFilters());

        document.getElementById('btnCreateNew')?.addEventListener('click', (e) => {
            e.preventDefault();
            GlobalUI.openModal('/Products/Create');
        });
    },

    // FONKSİYON TANIMLARINI KLASİK YAPIYA ÇEKTİK (Daha güvenli)
    view: function (id) { GlobalUI.openModal(`/Products/Details/${id}`); },
    edit: function (id) { GlobalUI.openModal(`/Products/Edit/${id}`); },
    delete: function (id) {
        if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            console.log("Silinecek ID:", id);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ProductManager.init());