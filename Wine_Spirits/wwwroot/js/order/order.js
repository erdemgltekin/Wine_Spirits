/**
 * Order Manager - Sipariş Yönetimi JS
 */
const OrderManager = {
    itemIndex: 1, // İlk satır zaten var (index 0)

    // Ürün Satırı Şablonu - _OrderCreatePartial.cshtml uyumlu
    itemTemplate: (index) => `
        <div class="ws-order-item-row" data-item-index="${index}">
            <div class="ws-filter-item">
                <i data-lucide="package"></i>
                <select name="OrderItems[${index}].ProductId" class="ws-filter-el select2-enable product-select" data-index="${index}">
                    <option value="">Ürün seçiniz...</option>
                </select>
            </div>
            <div class="ws-filter-item">
                <i data-lucide="hash"></i>
                <input type="number" name="OrderItems[${index}].Quantity" class="ws-filter-el quantity-input ws-input-premium" data-index="${index}" min="1" value="1" placeholder="0">
            </div>
            <div class="ws-filter-item">
                <i data-lucide="banknote"></i>
                <input type="number" name="OrderItems[${index}].UnitPrice" class="ws-filter-el price-input ws-input-premium" data-index="${index}" step="0.01" min="0" placeholder="0.00">
            </div>
            <button type="button" class="ws-btn-icon ws-btn-icon-danger remove-item-btn" data-index="${index}">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `,

    init: function () {
        this.initializeIcons();
        this.initializeDatepicker();
        this.attachEvents();
        this.refreshStatusStyles();
        this.initializeOrderCreate(); // Sipariş oluşturma mantığını başlat
    },

    initializeOrderCreate: function() {
        // Sadece sipariş modalında çalış
        if (document.getElementById('orderItemsContainer')) {
            this.loadProductsForSelect(0);
            this.calculateTotal();
            this.attachRowEventListeners(0);
        }
    },

    initializeIcons: () => { if (typeof lucide !== 'undefined') lucide.createIcons(); },

    initializeDatepicker: function () {
        const el = document.getElementById('orderDateFilter');
        if (el && typeof flatpickr !== 'undefined') {
            flatpickr(el, {
                locale: 'tr',
                mode: 'range',
                dateFormat: 'd.m.Y',
                disableMobile: true,
                // Takvimin açıldığında tasarımın üstüne binmemesi için
                animate: true,
                onReady: function (selectedDates, dateStr, instance) {
                    // Takvim açıldığında input'un stilini korumak için gerekirse müdahale
                    instance.calendarContainer.classList.add('shadow-lg', 'border-0', 'rounded-4');
                }
            });
        }
    },

    addItemRow: function () {
        const container = document.getElementById('orderItemsContainer');
        if (!container) return;

        const html = this.itemTemplate(this.itemIndex++);
        container.insertAdjacentHTML('beforeend', html);
        
        // Select2'yi yeniden başlat
        this.initializeSelect2ForRow(this.itemIndex - 1);
        
        // Ürün listesini yükle
        this.loadProductsForSelect(this.itemIndex - 1);
        
        // Event listener'ları ekle
        this.attachRowEventListeners(this.itemIndex - 1);
        
        // Lucide icon'larını yenile
        this.initializeIcons();
    },

    // Satır event listener'ları
    attachRowEventListeners: function(index) {
        // Miktar değişimi
        const quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
        if (quantityInput) {
            quantityInput.addEventListener('input', () => this.calculateTotal());
        }
        
        // Fiyat değişimi
        const priceInput = document.querySelector(`.price-input[data-index="${index}"]`);
        if (priceInput) {
            priceInput.addEventListener('input', () => this.calculateTotal());
        }
        
        // Sil butonu
        const removeBtn = document.querySelector(`.remove-item-btn[data-index="${index}"]`);
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeOrderItemRow(index));
        }
    },

    // Satır sil
    removeOrderItemRow: function(index) {
        const row = document.querySelector(`.ws-order-item-row[data-item-index="${index}"]`);
        if (row) {
            row.remove();
            this.calculateTotal();
            this.initializeIcons();
        }
    },

    // Select2'yi satır için başlat
    initializeSelect2ForRow: function(index) {
        if (!window.jQuery || !window.jQuery.fn.select2) return;
        
        const $select = window.jQuery(`.product-select[data-index="${index}"]`);
        if ($select.length) {
            const $modal = $select.closest('.modal');
            $select.select2({
                theme: 'default',
                width: '100%',
                placeholder: 'Ürün seçiniz...',
                dropdownParent: $modal.length ? $modal : window.jQuery(document.body)
            });
        }
    },

    // Ürün listesini yükle
    loadProductsForSelect: function(index) {
        fetch('/api/products/list')
            .then(response => response.json())
            .then(data => {
                const select = document.querySelector(`.product-select[data-index="${index}"]`);
                if (select && data.products) {
                    select.innerHTML = '<option value="">Ürün seçiniz...</option>';
                    data.products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = product.name;
                        option.dataset.price = product.price;
                        select.appendChild(option);
                    });
                    
                    // Select2'yi yenile
                    if (window.jQuery && window.jQuery.fn.select2) {
                        window.jQuery(select).trigger('change');
                    }
                }
            })
            .catch(error => console.error('Products load error:', error));
    },

    // Toplam tutarı hesapla
    calculateTotal: function() {
        const rows = document.querySelectorAll('.ws-order-item-row');
        let total = 0;
        
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.price-input')?.value) || 0;
            total += quantity * price;
        });
        
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = `₺${total.toFixed(2)}`;
        }
    },

    recalculateTotal: function () {
        this.calculateTotal(); // Yeni hesaplama metodunu çağır
    },

    applyStatusColor: function (select) {
        select.classList.remove('st-active', 'st-completed', 'st-cancelled');
        if (select.value === 'active') select.classList.add('st-active');
        if (select.value === 'completed') select.classList.add('st-completed');
        if (select.value === 'cancelled') select.classList.add('st-cancelled');
    },

    refreshStatusStyles: function () {
        document.querySelectorAll('.ws-status-select-minimal').forEach(s => this.applyStatusColor(s));
    },

    attachEvents: function () {
        // Yeni Satır Ekle
        document.getElementById('btnAddOrderItem')?.addEventListener('click', () => this.addItemRow());

        // Satır İçindeki Değişimler (Delegation)
        document.getElementById('orderItemsContainer')?.addEventListener('click', (e) => {
            if (e.target.closest('.ws-order-item-delete')) {
                const rows = document.querySelectorAll('.ws-order-item-row');
                if (rows.length > 1) {
                    e.target.closest('.ws-order-item-row').remove();
                    this.recalculateTotal();
                }
            }
        });

        document.getElementById('orderItemsContainer')?.addEventListener('change', (e) => {
            if (e.target.classList.contains('ws-order-product-select')) {
                const price = e.target.options[e.target.selectedIndex].dataset.price || 0;
                const row = e.target.closest('.ws-order-item-row');
                row.querySelector('.ws-order-price-input').value = price;
                this.recalculateTotal();
            }
        });

        document.getElementById('orderItemsContainer')?.addEventListener('input', (e) => {
            if (e.target.classList.contains('ws-order-qty-input') || e.target.classList.contains('ws-order-price-input')) {
                this.recalculateTotal();
            }
        });

        // Durum Değişikliği
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('ws-status-select-minimal')) {
                this.applyStatusColor(e.target);
            }
        });

    }
};

// Global Köprü
window.updateOrderFilter = function (type, value) {
    const label = document.getElementById('selectedStatus');
    if (label) label.innerText = value;
    // AJAX Filtreleme buraya gelecek
};

document.addEventListener('DOMContentLoaded', () => OrderManager.init());