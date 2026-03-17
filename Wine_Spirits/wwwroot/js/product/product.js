/**
 * Product Management Module - Pure Logic & Data
 */
const ProductManager = {
    allProducts: [],
    filteredProducts: [],
    currentFilters: { search: "", category: "", stock: "" },

    init: function () {
        this.loadProducts();
        this.attachEvents();
    },

    loadProducts: function () {
        fetch('/Products/GetProductsData', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(res => {
                this.allProducts = res.products || [];
                this.filteredProducts = [...this.allProducts];
                this.renderTable(this.filteredProducts);
            });
    },

    renderTable: function (products) {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">Ürün bulunamadı.</td></tr>';
            GlobalUI?.refreshLucide();
            return;
        }

        tableBody.innerHTML = products.map(p => {
            const priceStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.price || 0);
            const isCritical = p.stockQuantity <= 10;
            return `
            <tr>
                <td><strong>${p.productCode}</strong></td>
                <td><b>${p.name}</b></td>
                <td>${p.categoryName || '-'}</td>
                <td><small>${p.supplierName || '-'}</small></td>
                <td><strong>${priceStr}</strong></td>
                <td>${p.stockQuantity} Adet</td>
                <td><span class="status-pill ${isCritical ? 'status-danger' : 'status-success'}">${isCritical ? 'Kritik Stok' : 'Stokta Var'}</span></td>
                <td class="text-end">
                    <div class="ws-table-actions">
                        <button onclick="ProductManager.view('${p.id}')" class="ws-action-btn"><i data-lucide="eye"></i></button>
                        <button onclick="ProductManager.edit('${p.id}')" class="ws-action-btn"><i data-lucide="edit-2"></i></button>
                        <button onclick="ProductManager.delete('${p.id}')" class="ws-action-btn text-danger"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        GlobalUI?.refreshLucide();
    },

    filterCategory: function (val, text) {
        this.currentFilters.category = val;
        const el = document.getElementById('selectedCategoryText');
        if (el) el.innerText = text;
        this.applyFilters();
    },

    filterStock: function (val, text) {
        this.currentFilters.stock = val;
        const el = document.getElementById('selectedStockText');
        if (el) el.innerText = text;
        this.applyFilters();
    },

    applyFilters: function () {
        const s = document.getElementById('inventorySearch')?.value.toLowerCase() || "";
        const c = this.currentFilters.category;
        const st = this.currentFilters.stock;

        this.filteredProducts = this.allProducts.filter(p => {
            const matchesSearch = (p.name || "").toLowerCase().includes(s) || (p.productCode || "").toLowerCase().includes(s);
            const matchesCat = c === "" || p.categoryName === c;
            const matchesStock = st === "" || (st === "critical" ? p.stockQuantity <= 10 : (st === "in-stock" ? p.stockQuantity > 10 : true));
            return matchesSearch && matchesCat && matchesStock;
        });
        this.renderTable(this.filteredProducts);
    },

    populateCategories: function () {
        const catMenu = document.getElementById('filterCategoryMenu');
        if (!catMenu || this.allProducts.length === 0) return;
        const cats = [...new Set(this.allProducts.map(p => p.categoryName))].filter(Boolean).sort();
        let html = `<li><a class="dropdown-item" href="javascript:void(0)" onclick="ProductManager.filterCategory('', 'Tüm Kategoriler')">Tüm Kategoriler</a></li>`;
        html += cats.map(c => `<li><a class="dropdown-item" href="javascript:void(0)" onclick="ProductManager.filterCategory('${c}', '${c}')">${c}</a></li>`).join('');
        catMenu.innerHTML = html;
    },

    sort: function (type) {
        if (type === 'name-asc') this.filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        else if (type === 'price-desc') this.filteredProducts.sort((a, b) => b.price - a.price);
        else if (type === 'stock-desc') this.filteredProducts.sort((a, b) => b.stockQuantity - a.stockQuantity);
        this.renderTable(this.filteredProducts);
    },

    attachEvents: function () {
        document.getElementById('inventorySearch')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('btnCreateNew')?.addEventListener('click', (e) => {
            e.preventDefault();
            GlobalUI?.openModal('/Products/Create');
        });
    },

    view: function (id) { GlobalUI?.openModal(`/Products/Details/${id}`); },
    edit: function (id) { GlobalUI?.openModal(`/Products/Edit/${id}`); },
    delete: function (id) { if (confirm('Bu ürünü silmek istediğine emin misin?')) console.log("Delete:", id); }
};