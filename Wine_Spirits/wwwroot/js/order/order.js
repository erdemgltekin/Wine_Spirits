/**
 * Order Manager
 * Sipariş sayfası etkileşimlerini yönetir:
 * - Modal açma/kapama
 * - Dinamik sipariş kalemi ekleme/silme
 * - Gerçek zamanlı toplam tutar hesaplama
 * - Flatpickr tarih seçici
 * - Inline durum dropdown renklendirme
 */
const OrderManager = {

    itemIndex: 1, // İlk satır index=0 ile HTML'de geliyor

    // Ürün şablonu (JS ile klonlanacak)
    itemTemplate: `
        <div class="ws-order-item-row" data-item-index="{INDEX}">
            <div class="ws-order-item-grid">
                <div class="ws-order-item-field">
                    <label class="ws-order-item-label">Ürün</label>
                    <select class="ws-order-item-select ws-order-product-select">
                        <option value="" selected disabled>Ürün seçin</option>
                        <option value="1" data-price="485">Chardonnay Reserve 2022</option>
                        <option value="2" data-price="620">Merlot Special Selection</option>
                        <option value="3" data-price="1250">Vintage Cognac 50cl</option>
                        <option value="4" data-price="340">Rosé Provence 2023</option>
                        <option value="5" data-price="2100">Scotch Whisky 12Y</option>
                    </select>
                </div>
                <div class="ws-order-item-field">
                    <label class="ws-order-item-label">Miktar</label>
                    <input type="number" class="ws-order-item-input ws-order-qty-input"
                           value="1" min="1" placeholder="1">
                </div>
                <div class="ws-order-item-field">
                    <label class="ws-order-item-label">Birim Fiyat</label>
                    <div class="ws-order-price-wrapper">
                        <span class="ws-order-price-symbol">₺</span>
                        <input type="number" class="ws-order-item-input ws-order-price-input"
                               value="0" min="0" placeholder="0">
                    </div>
                </div>
            </div>
            <button type="button" class="ws-order-item-delete" title="Kalemi Sil">
                <i data-lucide="trash-2"></i>
            </button>
        </div>`,

    init: function () {
        this.initializeIcons();
        this.initializeDatepicker();
        this.attachEvents();
    },

    initializeIcons: function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    initializeDatepicker: function () {
        const dateInput = document.getElementById('orderDateFilter');
        if (dateInput && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                locale: 'tr',
                mode: 'range',
                dateFormat: 'd.m.Y',
                allowInput: false,
                disableMobile: true
            });
        }
    },

    attachEvents: function () {
        // --- Modal Açma ---
        const btnNew = document.getElementById('btnNewOrder');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('newOrderModal'));
                modal.show();
            });
        }

        // --- Modal Açıldığında Formu Sıfırla ---
        const modalEl = document.getElementById('newOrderModal');
        if (modalEl) {
            modalEl.addEventListener('show.bs.modal', () => {
                OrderManager.resetForm();
            });
        }

        // --- Kalem Ekle Butonu ---
        const btnAddItem = document.getElementById('btnAddOrderItem');
        if (btnAddItem) {
            btnAddItem.addEventListener('click', () => {
                OrderManager.addItemRow();
            });
        }

        // --- Konteyner üzerinden event delegation (sil + değişim) ---
        const container = document.getElementById('orderItemsContainer');
        if (container) {
            // Sil butonu
            container.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.ws-order-item-delete');
                if (deleteBtn) {
                    const row = deleteBtn.closest('.ws-order-item-row');
                    const allRows = container.querySelectorAll('.ws-order-item-row');
                    if (allRows.length > 1) {
                        row.style.animation = 'none';
                        row.style.opacity = '0';
                        row.style.transform = 'translateY(-8px)';
                        row.style.transition = 'all 0.18s ease';
                        setTimeout(() => {
                            row.remove();
                            OrderManager.recalculateTotal();
                        }, 180);
                    }
                }
            });

            // Ürün seçildiğinde birim fiyatı otomatik doldur
            container.addEventListener('change', (e) => {
                if (e.target.classList.contains('ws-order-product-select')) {
                    const row = e.target.closest('.ws-order-item-row');
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const price = selectedOption.getAttribute('data-price') || '0';
                    const priceInput = row.querySelector('.ws-order-price-input');
                    if (priceInput) {
                        priceInput.value = price;
                    }
                    OrderManager.recalculateTotal();
                }
            });

            // Miktar veya fiyat değiştiğinde toplam güncelle
            container.addEventListener('input', (e) => {
                if (e.target.classList.contains('ws-order-qty-input') ||
                    e.target.classList.contains('ws-order-price-input')) {
                    OrderManager.recalculateTotal();
                }
            });
        }

        // --- Form Gönderimi ---
        const form = document.getElementById('formNewOrder');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Sipariş gönderiliyor...');
                // Backend entegrasyonu buraya eklenecek
            });
        }

        // --- Sıralama Seçenekleri ---
        document.querySelectorAll('[data-sort]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('[data-sort]').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // --- Inline Durum Dropdown Renklendirme ---
        document.querySelectorAll('.ws-status-select').forEach(select => {
            OrderManager.applyStatusColor(select);
            select.addEventListener('change', function () {
                OrderManager.applyStatusColor(this);
            });
        });
    },

    addItemRow: function () {
        const container = document.getElementById('orderItemsContainer');
        if (!container) return;

        const html = this.itemTemplate.replace('{INDEX}', this.itemIndex++);
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();
        const newRow = temp.firstElementChild;
        container.appendChild(newRow);

        // Lucide ikonlarını yeni satır için yeniden başlat
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Son eklenen satıra scroll
        newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    recalculateTotal: function () {
        const container = document.getElementById('orderItemsContainer');
        const totalEl = document.getElementById('orderTotalAmount');
        if (!container || !totalEl) return;

        let total = 0;
        container.querySelectorAll('.ws-order-item-row').forEach(row => {
            const qty = parseFloat(row.querySelector('.ws-order-qty-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.ws-order-price-input')?.value) || 0;
            total += qty * price;
        });

        totalEl.textContent = '₺' + total.toLocaleString('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    },

    resetForm: function () {
        const form = document.getElementById('formNewOrder');
        if (form) form.reset();

        const container = document.getElementById('orderItemsContainer');
        if (container) {
            // Tüm satırları sil, ilk satırı yeniden ekle
            container.innerHTML = `
                <div class="ws-order-item-row" data-item-index="0">
                    <div class="ws-order-item-grid">
                        <div class="ws-order-item-field">
                            <label class="ws-order-item-label">Ürün</label>
                            <select class="ws-order-item-select ws-order-product-select">
                                <option value="" selected disabled>Ürün seçin</option>
                                <option value="1" data-price="485">Chardonnay Reserve 2022</option>
                                <option value="2" data-price="620">Merlot Special Selection</option>
                                <option value="3" data-price="1250">Vintage Cognac 50cl</option>
                                <option value="4" data-price="340">Rosé Provence 2023</option>
                                <option value="5" data-price="2100">Scotch Whisky 12Y</option>
                            </select>
                        </div>
                        <div class="ws-order-item-field">
                            <label class="ws-order-item-label">Miktar</label>
                            <input type="number" class="ws-order-item-input ws-order-qty-input"
                                   value="1" min="1" placeholder="1">
                        </div>
                        <div class="ws-order-item-field">
                            <label class="ws-order-item-label">Birim Fiyat</label>
                            <div class="ws-order-price-wrapper">
                                <span class="ws-order-price-symbol">₺</span>
                                <input type="number" class="ws-order-item-input ws-order-price-input"
                                       value="0" min="0" placeholder="0">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="ws-order-item-delete" title="Kalemi Sil">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        this.itemIndex = 1;
        const totalEl = document.getElementById('orderTotalAmount');
        if (totalEl) totalEl.textContent = '₺0';
    },

    applyStatusColor: function (select) {
        select.classList.remove('status-active', 'status-completed', 'status-cancelled');
        const val = select.value;
        if (val === 'active') select.classList.add('status-active');
        else if (val === 'completed') select.classList.add('status-completed');
        else if (val === 'cancelled') select.classList.add('status-cancelled');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    OrderManager.init();
});
