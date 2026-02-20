/**
 * @file order.js
 * @path wwwroot/js/pages/order.js
 * @description Sipariş sayfası yönetim scripti.
 */

const OrderManager = {
    itemIndex: 1,

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
                    <input type="number" class="ws-order-item-input ws-order-qty-input" value="1" min="1">
                </div>
                <div class="ws-order-item-field">
                    <label class="ws-order-item-label">Birim Fiyat</label>
                    <div class="ws-order-price-wrapper">
                        <span class="ws-order-price-symbol">₺</span>
                        <input type="number" class="ws-order-item-input ws-order-price-input" value="0" min="0">
                    </div>
                </div>
            </div>
            <button type="button" class="ws-order-item-delete" title="Kalemi Sil">
                <i data-lucide="trash-2"></i>
            </button>
        </div>`,

    init: function () {
        this.initIcons();
        this.initDatePicker();
        this.bindEvents();
    },

    initIcons: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    initDatePicker: function () {
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

    bindEvents: function () {
        const btnNew = document.getElementById('btnNewOrder');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('newOrderModal'));
                modal.show();
            });
        }

        const modalEl = document.getElementById('newOrderModal');
        if (modalEl) {
            modalEl.addEventListener('show.bs.modal', () => this.resetForm());
        }

        const btnAddItem = document.getElementById('btnAddOrderItem');
        if (btnAddItem) {
            btnAddItem.addEventListener('click', () => this.addItemRow());
        }

        const container = document.getElementById('orderItemsContainer');
        if (container) {
            container.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.ws-order-item-delete');
                if (deleteBtn) {
                    const row = deleteBtn.closest('.ws-order-item-row');
                    if (container.querySelectorAll('.ws-order-item-row').length > 1) {
                        row.remove();
                        this.recalculateTotal();
                    }
                }
            });

            container.addEventListener('change', (e) => {
                if (e.target.classList.contains('ws-order-product-select')) {
                    const row = e.target.closest('.ws-order-item-row');
                    const price = e.target.options[e.target.selectedIndex].dataset.price || '0';
                    const priceInput = row.querySelector('.ws-order-price-input');
                    if (priceInput) priceInput.value = price;
                    this.recalculateTotal();
                }
            });

            container.addEventListener('input', (e) => {
                if (e.target.classList.contains('ws-order-qty-input') || e.target.classList.contains('ws-order-price-input')) {
                    this.recalculateTotal();
                }
            });
        }

        document.querySelectorAll('.ws-status-select').forEach(select => {
            this.applyStatusColor(select);
            select.addEventListener('change', () => this.applyStatusColor(select));
        });
    },

    addItemRow: function () {
        const container = document.getElementById('orderItemsContainer');
        if (!container) return;
        const html = this.itemTemplate.replace('{INDEX}', this.itemIndex++);
        container.insertAdjacentHTML('beforeend', html);
        this.initIcons();
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
        totalEl.textContent = '₺' + total.toLocaleString('tr-TR');
    },

    resetForm: function () {
        const container = document.getElementById('orderItemsContainer');
        if (container) {
            container.innerHTML = this.itemTemplate.replace('{INDEX}', '0');
            this.initIcons();
        }
        this.itemIndex = 1;
        this.recalculateTotal();
    },

    applyStatusColor: function (select) {
        select.classList.remove('status-active', 'status-completed', 'status-cancelled');
        if (select.value === 'active') select.classList.add('status-active');
        else if (select.value === 'completed') select.classList.add('status-completed');
        else if (select.value === 'cancelled') select.classList.add('status-cancelled');
    }
};

document.addEventListener('DOMContentLoaded', () => OrderManager.init());
