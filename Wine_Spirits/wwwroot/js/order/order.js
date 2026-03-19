/**
 * Order Manager - Sipariş Yönetimi JS
 * Kolon sarmallı (div) yapı ve dinamik satır yönetimi
 */
const OrderManager = {
    itemIndex: 1,

    // GÜNCELLENDİ: Birim fiyat default 0.00 olarak template'e işlendi
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
                       data-index="${index}" step="0.01" min="0" value="0.00">
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
        $(document).on('shown.bs.modal', '#productModal', () => {
            this.initializeOrderCreate();
        });
    },

    initializeOrderCreate: function () {
        const container = document.getElementById('orderItemsContainer');
        if (container) {
            // Eğer modal her açıldığında temizlenmesi gerekiyorsa indexi sıfırla
            // Mevcut satırları sayarak index'i güncelle
            const existingRows = container.querySelectorAll('.ws-order-item-row');
            this.itemIndex = existingRows.length > 0 ? existingRows.length : 1;

            // İlk satır ve mevcut satırlar için hazırlık
            existingRows.forEach((row, i) => {
                this.loadProductsForSelect(i);
                this.initializeSelect2ForRow(i);
            });

            this.calculateTotal();
            this.attachOrderItemEvents();
        }
    },

    attachGlobalEvents: function () {
        // Hem ID hem data-attribute üzerinden yakalama (Daha güvenli)
        $(document).on('click', '#btnNewOrder, #btnCreateOrder, [data-order-create="true"]', (e) => {
            e.preventDefault();
            if (typeof GlobalUI !== 'undefined') {
                GlobalUI.openModal('/Orders/Create', 'modal-lg');
            }
        });
    },

    attachOrderItemEvents: function () {
        // Ürün Ekle Butonu (Mükerrer bind engelleme)
        const addBtn = document.getElementById('btnAddOrderItem');
        if (addBtn) {
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            newAddBtn.addEventListener('click', () => this.addItemRow());
        }

        const container = document.getElementById('orderItemsContainer');
        if (container) {
            // Event Delegation ile silme işlemi
            $(container).off('click', '.remove-item-btn').on('click', '.remove-item-btn', (e) => {
                const rows = container.querySelectorAll('.ws-order-item-row');
                if (rows.length > 1) {
                    const $row = $(e.currentTarget).closest('.ws-order-item-row');
                    $row.fadeOut(300, function () {
                        $(this).remove();
                        OrderManager.calculateTotal();
                    });
                } else {
                    // Modern uyarı
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({ icon: 'warning', title: 'Dikkat', text: 'En az bir kalem olmalı.' });
                    } else {
                        alert("Siparişte en az bir ürün bulunmalıdır.");
                    }
                }
            });

            // Miktar ve fiyat değişimlerini izle
            container.addEventListener('input', (e) => {
                if (e.target.matches('.quantity-input, .price-input')) {
                    this.calculateTotal();
                }
            });
        }

        // AJAX Form Gönderimi (Senin orijinal fetch yapın)
        const form = document.getElementById('createOrderModalForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalContent = submitBtn.innerHTML;

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Kaydediliyor...';

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: new FormData(form),
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    });

                    const data = await response.json();
                    if (data.success) {
                        if (typeof SidePanel !== 'undefined') {
                            SidePanel.showToast(data.message || "Sipariş oluşturuldu");
                        }
                        location.reload();
                    } else {
                        alert(data.message || "Bir hata oluştu.");
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalContent;
                    }
                } catch (err) {
                    console.error("Sipariş hatası:", err);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
            };
        }
    },

    addItemRow: function () {
        const container = $('#orderItemsContainer');
        const idx = this.itemIndex++;

        // Yeni satırı ekle
        const $newRow = $(this.itemTemplate(idx)).hide();
        container.append($newRow);
        $newRow.fadeIn(300);

        // Yeni satırın bileşenlerini yükle
        this.loadProductsForSelect(idx);
        this.initializeIcons();
    },

    initializeSelect2ForRow: function (index) {
        if (!window.jQuery || !window.jQuery.fn.select2) return;
        const $sel = jQuery(`.product-select[data-index="${index}"]`);

        $sel.select2({
            dropdownParent: jQuery('#createOrderModalForm').closest('.modal'),
            width: '100%',
            placeholder: 'Ürün seçiniz...',
            templateSelection: (data) => {
                if (!data.id) return data.text;
                return jQuery(`<span class="fw-medium">${data.text}</span>`);
            }
        }).on('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            const price = selected ? selected.dataset.price : 0;
            const $row = $(e.target).closest('.ws-order-item-row');

            if ($row.length) {
                const $priceInput = $row.find('.price-input');
                if ($priceInput.length) {
                    $priceInput.val(parseFloat(price).toFixed(2));
                    this.calculateTotal();
                }
            }
        });
    },

    loadProductsForSelect: async function (index) {
        try {
            // API yolunu kendi projenle eşleştir (Örn: /Orders/GetProducts)
            const response = await fetch('/Orders/GetProducts');
            const data = await response.json();

            const sel = document.querySelector(`.product-select[data-index="${index}"]`);
            if (sel && data) {
                // Eğer data doğrudan liste ise veya .products içindeyse ona göre uyarla
                const productList = data.products || data;

                sel.innerHTML = '<option value="">Ürün seçiniz...</option>';
                productList.forEach(p => {
                    const opt = new Option(p.text || p.name, p.value || p.id);
                    opt.dataset.price = p.price || 0;
                    sel.add(opt);
                });

                // Select2'yi şimdi başlat (Veriler dolduktan sonra)
                this.initializeSelect2ForRow(index);
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

    initializeIcons: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// Başlatma
document.addEventListener('DOMContentLoaded', () => OrderManager.init());