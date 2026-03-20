/**
 * Product Management Module - Pure Logic, Data & Form Handling
 */
const ProductManager = {
    allProducts: [],
    filteredProducts: [],
    currentFilters: { search: "", category: "", stock: "" },

    init: function () {
        this.loadProducts();
        this.attachEvents();
        this.initFormHandler();
    },

    loadProducts: function () {
        fetch('/Products/GetProductsData', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(res => {
                this.allProducts = res.products || [];
                this.filteredProducts = [...this.allProducts];
                this.renderTable(this.filteredProducts);
                this.populateCategories();
            })
            .catch(err => console.error("Veri yükleme hatası:", err));
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
                <td><strong>${p.productCode || 'N/A'}</strong></td>
                <td><b>${p.name || 'İsimsiz'}</b></td>
                <td>${p.categoryName || '-'}</td>
                <td><small>${p.supplierName || '-'}</small></td>
                <td><strong>${priceStr}</strong></td>
                <td>${p.stockQuantity} Adet</td>
                <td><span class="status-pill ${isCritical ? 'status-danger' : 'status-success'}">${isCritical ? 'Kritik Stok' : 'Stokta Var'}</span></td>
                <td class="text-end">
                    <div class="ws-table-actions">
                        <button onclick="ProductManager.view('${p.id}')" class="ws-action-btn" title="Görüntüle"><i data-lucide="eye"></i></button>
                        <button onclick="ProductManager.edit('${p.id}')" class="ws-action-btn" title="Düzenle"><i data-lucide="edit-2"></i></button>
                        <button onclick="ProductManager.delete('${p.id}')" class="ws-action-btn text-danger" title="Sil"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        GlobalUI?.refreshLucide();
    },

    initFormHandler: function () {
        document.addEventListener('submit', async (e) => {
            if (e.target && e.target.id === 'productForm') {
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                const url = form.getAttribute('action');

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    });

                    if (response.headers.get("content-type")?.includes("application/json")) {
                        const result = await response.json();
                        if (result.success) {
                            // Modal kapatma (GlobalUI metodunu veya bootstrap'i kullanıyoruz)
                            if (typeof GlobalUI !== 'undefined' && GlobalUI.closeModal) {
                                GlobalUI.closeModal();
                            } else {
                                const modalEl = document.querySelector('.modal.show');
                                if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
                            }

                            Swal.fire({ icon: 'success', title: 'Başarılı!', text: 'İşlem tamamlandı.', timer: 1500, showConfirmButton: false });
                            this.loadProducts();
                        }
                    } else {
                        const errorHtml = await response.text();
                        // Hata durumunda modal içeriğini güncelle (ID'nin doğruluğundan emin ol)
                        const contentDiv = document.getElementById('GlobalModalContent') || document.getElementById('productModalContent');
                        if (contentDiv) {
                            contentDiv.innerHTML = errorHtml;
                            GlobalUI?.refreshLucide();
                            if (typeof GlobalUI !== 'undefined' && GlobalUI.initSelect2) GlobalUI.initSelect2();
                        }
                    }
                } catch (err) {
                    console.error("Form gönderim hatası:", err);
                    Swal.fire('Hata', 'İşlem sırasında bir hata oluştu.', 'error');
                }
            }
        });
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

    attachEvents: function () {
        // Arama kutusu dinleyici
        document.getElementById('inventorySearch')?.addEventListener('input', () => this.applyFilters());

        // Yeni Ürün Ekle Butonu (ID: btnCreateNew)
        $(document).on('click', '#btnCreateNew', (e) => {
            e.preventDefault();
            GlobalUI?.openModal('/Products/Create');
        });
    },

    view: function (id) { GlobalUI?.openModal(`/Products/Details/${id}`); },
    edit: function (id) { GlobalUI?.openModal(`/Products/Edit/${id}`); },
    delete: function (id) {
        Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu ürün envanterden silinecek!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/Products/Delete/${id}`, {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            this.loadProducts();
                            Swal.fire('Silindi!', 'Ürün başarıyla kaldırıldı.', 'success');
                        }
                    });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ProductManager.init());