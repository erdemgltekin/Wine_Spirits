/**
 * Order Manager - Sipariş Yönetimi JS
 */
const OrderManager = {
    itemIndex: 0,

    // Ürün Satırı Şablonu
    itemTemplate: (index) => `
        <div class="ws-order-item-row d-flex gap-2 mb-2 align-items-end animate-in" data-index="${index}">
            <div class="flex-grow-1">
                <select class="form-select ws-order-product-select small">
                    <option value="" selected disabled>Ürün seçin</option>
                    <option value="1" data-price="450">Chardonnay 2022</option>
                    <option value="2" data-price="850">Red Wine Reserve</option>
                </select>
            </div>
            <div style="width: 100px;">
                <input type="number" class="form-control ws-order-qty-input small" value="1" min="1">
            </div>
            <div style="width: 140px;">
                <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white">₺</span>
                    <input type="number" class="form-control ws-order-price-input" value="0">
                </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm ws-order-item-delete" style="padding: 0.4rem 0.6rem;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        </div>
    `,

    init: function () {
        this.initializeIcons();
        this.initializeDatepicker();
        this.attachEvents();
        this.refreshStatusStyles();
        this.addItemRow(); // İlk satırı otomatik ekle
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
        this.initializeIcons();
    },

    recalculateTotal: function () {
        let total = 0;
        document.querySelectorAll('.ws-order-item-row').forEach(row => {
            const qty = parseFloat(row.querySelector('.ws-order-qty-input').value) || 0;
            const price = parseFloat(row.querySelector('.ws-order-price-input').value) || 0;
            total += qty * price;
        });
        document.getElementById('orderTotalAmount').innerText = '₺' + total.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
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

        // Modal Tetikleyici
        document.getElementById('btnNewOrder')?.addEventListener('click', () => {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('newOrderModal'));
            modal.show();
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