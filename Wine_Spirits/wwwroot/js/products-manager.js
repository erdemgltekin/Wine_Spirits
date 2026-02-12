/**
 * Wine & Spirits - Product Inventory Manager (Revize)
 */
const ProductManager = {
    allProducts: [],
    bsModal: null,

    init: function () {
        const modalEl = document.getElementById('productModal');
        if (modalEl) {
            this.bsModal = new bootstrap.Modal(modalEl);
        }

        this.loadProducts();
        this.attachEvents();
    },

    // 1. Verileri Yükle
    loadProducts: function () {
        const tbody = document.getElementById('productsTableBody');
        // Yükleniyor animasyonu göster (opsiyonel)

        fetch('/Products/GetProductsData', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => {
                if (!r.ok) throw new Error("Sunucu hatası: " + r.status);
                return r.json();
            })
            .then(res => {
                this.allProducts = res.products || [];
                this.renderTable(this.allProducts);
                this.updateStats(res.stats);
            })
            .catch(err => {
                console.error("Veri yüklenemedi:", err);
                if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Veriler yüklenirken bir hata oluştu.</td></tr>`;
            });
    },

    // 2. Tabloyu Çiz
    renderTable: function (list) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5">Ürün bulunamadı.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(p => `
            <tr>
                <td class="ps-4"><span class="badge bg-light text-dark border">${p.productCode || '---'}</span></td>
                <td><strong>${p.name}</strong><br><small class="text-muted">${p.supplierName || '-'}</small></td>
                <td>${p.categoryName || '-'}</td>
                <td>${p.countryName || '-'}</td>
                <td>₺${(p.price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                <td><span class="badge ${p.stockQuantity < 10 ? 'bg-danger' : 'bg-success'}">${p.stockQuantity}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary border-0" onclick="ProductManager.editProduct('${p.id}')">
                        <i data-lucide="edit-3" style="width:16px;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    // 3. Kart İstatistiklerini Güncelle
    updateStats: function (s) {
        if (!s) return;
        const update = (key, val) => {
            const container = document.querySelector(`[ws-stat="${key}"]`);
            if (container) {
                // Hem h3 hem de özel class'ları kontrol et
                const valueEl = container.querySelector('h3') ||
                    container.querySelector('.ws-stat-value') ||
                    container;
                valueEl.innerText = val;
            }
        };

        update('totalProducts', s.totalProducts || 0);
        update('criticalStock', s.criticalStockCount || 0);
        update('categoryCount', s.categoryCount || 0);

        const totalVal = (s.totalInventoryValue || 0).toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        });
        update('inventoryValue', totalVal);
    },

    // 4. Formu Sunucuya Bağla (KAYDETME HATASININ ÇÖZÜMÜ)
    bindForm: function () {
        const form = document.getElementById('createProductForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Bekleyin...';

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        this.bsModal.hide();
                        this.loadProducts(); // Tabloyu ve kartları tazele
                    } else {
                        alert("Hata: " + (res.message || "Kaydedilemedi."));
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Kaydet";
                    }
                })
                .catch(err => {
                    console.error("Form gönderme hatası:", err);
                    alert("Sistemsel bir hata oluştu.");
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Kaydet";
                });
        });
    },

    // 5. Olay Dinleyicileri
    attachEvents: function () {
        // Arama Çubuğu
        document.getElementById('inventorySearch')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            const filtered = this.allProducts.filter(x =>
                x.name.toLowerCase().includes(this.searchQuery) ||
                x.productCode.toLowerCase().includes(this.searchQuery)
            );
            this.renderTable(filtered);
        });

        // Yeni Ürün Ekle Butonu
        document.getElementById('btnCreateNew')?.addEventListener('click', () => {
            const body = document.getElementById('productModalBody');
            body.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary"></div><p class="mt-2">Form hazırlanıyor...</p></div>';
            this.bsModal.show();

            fetch('/Products/Create', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.text())
                .then(html => {
                    body.innerHTML = html;
                    if (window.lucide) lucide.createIcons();
                    this.bindForm(); // Form yüklendikten sonra submit olayını bağla
                });
        });
    },

    editProduct: function (id) {
        console.log("Düzenleme modu henüz aktif değil. ID:", id);
    }
};

// Sayfa hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', () => ProductManager.init());