/**
 * Order Manager - Sipariş Yönetimi JS
 * Kolon sarmallı (div) yapı ve dinamik satır yönetimi
 */
const OrderManager = {
    itemIndex: 1,

    // YENİ: Kolon yapısıyla (col-product, col-qty vb.) tam uyumlu şablon
    itemTemplate: (index) => `
        <div class="ws-order-item-row" data-item-index="${index}">
            <div class="col-product">
                <select name="OrderItems[${index}].ProductId" class="ws-input-premium product-select" data-index="${index}">
                    <option value="">Ürün seçiniz...</option>
                </select>
            </div>
            <div class="col-qty">
                <input type="number" name="OrderItems[${index}].Quantity" class="ws-input-premium quantity-input text-center" 
                       data-index="${index}" min="1" value="1">
            </div>
            <div class="col-price">
                <input type="number" name="OrderItems[${index}].UnitPrice" class="ws-input-premium price-input text-end" 
                       data-index="${index}" step="0.01" min="0">
            </div>
            <div class="col-action">
                <button type="button" class="remove-item-btn" title="Satırı Sil">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `,

    init: function () {
        this.attachGlobalEvents();
        this.initializeIcons();

        // Modal açıldığında içeriği kur
        $(document).on('shown.bs.modal', '.modal', () => {
            this.initializeOrderCreate();
        });
    },

    initializeOrderCreate: function () {
        const container = document.getElementById('orderItemsContainer');
        if (container) {
            this.itemIndex = 1;
            // İlk satır için hazırlık (Index 0)
            this.loadProductsForSelect(0);
            this.initializeSelect2ForRow(0);
            this.calculateTotal();
            this.attachOrderItemEvents();
        }
    },

    attachGlobalEvents: function () {
        const createBtn = document.getElementById('btnNewOrder') || document.getElementById('btnCreateOrder');
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof GlobalUI !== 'undefined') {
                    GlobalUI.openModal('/Orders/Create', 'modal-lg');
                }
            });
        }
    },

    attachOrderItemEvents: function () {
        const addBtn = document.getElementById('btnAddOrderItem');
        if (addBtn) {
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            newAddBtn.addEventListener('click', () => this.addItemRow());
        }

        const container = document.getElementById('orderItemsContainer');
        if (container) {
            container.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-item-btn');
                if (removeBtn) {
                    const rows = container.querySelectorAll('.ws-order-item-row');
                    if (rows.length > 1) {
                        const $row = jQuery(removeBtn.closest('.ws-order-item-row'));
                        $row.fadeOut(300, function() {
                            jQuery(this).remove();
                            OrderManager.calculateTotal();
                        });
                    } else {
                        alert("Siparişte en az bir ürün bulunmalıdır.");
                    }
                }
            });

            container.addEventListener('input', (e) => {
                if (e.target.matches('.quantity-input, .price-input')) {
                    this.calculateTotal();
                }
            });
        }

        // AJAX Form Gönderimi
        const form = document.getElementById('createOrderModalForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: new FormData(form),
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    });
                    const data = await response.json();
                    if (data.success) {
                        location.reload();
                    } else {
                        alert(data.message || "Bir hata oluştu.");
                    }
                } catch (err) {
                    console.error("Sipariş hatası:", err);
                } finally {
                    submitBtn.disabled = false;
                }
            };
        }
    },

    addItemRow: function () {
        const container = $( '#orderItemsContainer' );
        const idx = this.itemIndex++;

        // Yeni satırı ekle (Gizli olarak ekle ve yavaşça göster)
        const $newRow = $(this.itemTemplate(idx)).hide();
        container.append($newRow);
        $newRow.fadeIn(300);

        // Yeni satırın bileşenlerini yükle
        this.loadProductsForSelect(idx);
        this.initializeSelect2ForRow(idx);
        this.initializeIcons();
    },

    initializeSelect2ForRow: function (index) {
        if (!window.jQuery || !window.jQuery.fn.select2) return;
        const $sel = jQuery(`.product-select[data-index="${index}"]`);

        $sel.select2({
            dropdownParent: jQuery('#createOrderModalForm').closest('.modal'),
            width: '100%',
            templateSelection: (data) => {
                if (!data.id) return data.text;
                return jQuery(`<span class="fw-medium">${data.text}</span>`);
            }
        }).on('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const price = selected ? selected.dataset.price : 0;
            const row = e.target.closest('.ws-order-item-row');
            if (row) {
                const priceInput = row.querySelector('.price-input');
                if (priceInput) {
                    priceInput.value = price || 0;
                    this.calculateTotal();
                }
            }
        });
    },

    loadProductsForSelect: async function (index) {
        try {
            const response = await fetch('/api/products/list');
            const data = await response.json();

            const sel = document.querySelector(`.product-select[data-index="${index}"]`);
            if (sel && data.products) {
                sel.innerHTML = '<option value="">Ürün seçiniz...</option>';
                data.products.forEach(p => {
                    const opt = new Option(p.name, p.id);
                    opt.dataset.price = p.price;
                    sel.add(opt);
                });

                // Select2 değerleri görmesi için tetikle
                if (window.jQuery && window.jQuery.fn.select2) {
                    window.jQuery(sel).trigger('change.select2');
                }
            }
        } catch (error) {
            console.error('Ürünler yüklenemedi:', error);
        }
    },

    calculateTotal: function () {
        let total = 0;
        document.querySelectorAll('.ws-order-item-row').forEach(row => {
            const q = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const p = parseFloat(row.querySelector('.price-input')?.value) || 0;
            total += q * p;
        });

        const el = document.getElementById('totalAmount');
        if (el) {
            el.textContent = `₺${total.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    },

    initializeIcons: () => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => OrderManager.init());