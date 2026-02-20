/**
 * @file supplier.js
 * @path wwwroot/js/pages/supplier.js
 * @description Premium V3 Tedarikçi Yönetimi Script Dosyası
 * @global Standards: No inline scripts, robust error handling, AJAX integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    SupplierPage.init();
});

const SupplierPage = {
    init: function () {
        this.initLucide();
        this.initDatePicker();
        this.initSearchAndFilters();
        this.initActionEvents();
    },

    initLucide: function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Flatpickr (Tarih Aralığı) yapılandırması - Türkçe ve Range Modu
     */
    initDatePicker: function () {
        if (typeof flatpickr !== 'undefined' && document.querySelector(".flatpickr-date")) {
            flatpickr(".flatpickr-date", {
                locale: "tr",
                mode: "range",
                dateFormat: "d.m.Y",
                allowInput: true,
                disableMobile: true,
                onClose: () => this.filterCards()
            });
        }
    },

    /**
     * Arama ve Filtreleme İşlemleri
     */
    initSearchAndFilters: function () {
        const searchInput = document.getElementById('supplierSearch');
        const countryFilter = document.getElementById('filterCountry');
        const statusFilter = document.getElementById('filterStatus');

        searchInput?.addEventListener('input', this.debounce(() => this.filterCards(), 300));
        countryFilter?.addEventListener('change', () => this.filterCards());
        statusFilter?.addEventListener('change', () => this.filterCards());
    },

    /**
     * Kartları arama ve filtrelere göre gizle/göster
     */
    filterCards: function () {
        const searchTerm = document.getElementById('supplierSearch')?.value.toLowerCase() || '';
        const selectedCountry = document.getElementById('filterCountry')?.value.toLowerCase() || '';
        const statusValue = document.getElementById('filterStatus')?.value || '';
        const dateRangeStr = document.getElementById('filterDate')?.value || '';

        const cards = document.querySelectorAll('#suppliersCardContainer .ws-supplier-card-wrapper');

        let startDate = null;
        let endDate = null;

        if (dateRangeStr.includes(' — ')) {
            const parts = dateRangeStr.split(' — ');
            startDate = this.parseTurkishDate(parts[0]);
            endDate = this.parseTurkishDate(parts[1]);
        }

        cards.forEach(cardWrapper => {
            const text = cardWrapper.textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);

            const countryEl = cardWrapper.querySelector('.ws-detail-country');
            const cardCountry = countryEl ? countryEl.textContent.toLowerCase() : '';
            const matchesCountry = selectedCountry === '' || cardCountry.includes(selectedCountry);

            const badgeEl = cardWrapper.querySelector('.ws-status-text');
            let cardStatus = badgeEl?.textContent.toLowerCase().includes('aktif') ? 'active' : 'inactive';
            const matchesStatus = statusValue === '' || cardStatus === statusValue;

            let matchesDate = true;
            const cardDateStr = cardWrapper.getAttribute('data-date');
            if (cardDateStr && (startDate || endDate)) {
                const cardDate = new Date(cardDateStr);
                cardDate.setHours(0, 0, 0, 0);
                if (startDate && cardDate < startDate) matchesDate = false;
                if (endDate && cardDate > endDate) matchesDate = false;
            }

            cardWrapper.style.display = (matchesSearch && matchesCountry && matchesStatus && matchesDate) ? 'block' : 'none';
        });
    },

    /**
     * Event Listener'ları bağla
     */
    initActionEvents: function () {
        // Aktif/Pasif Değişimi
        document.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                this.toggleSupplierStatus(id, btn);
            });
        });

        // Silme (Arşivleme)
        document.querySelectorAll('.btn-delete-supplier').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const card = btn.closest('.ws-supplier-card-wrapper');

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Emin misiniz?',
                        text: "Tedarikçi sistemden kaldırılarak arşive aktarılacak.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#6366f1',
                        cancelButtonColor: '#f43f5e',
                        confirmButtonText: 'Evet, Arşivle',
                        cancelButtonText: 'Vazgeç'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.deleteSupplier(id, card);
                        }
                    });
                } else if (confirm('Tedarikçiyi arşive kaldırmak istediğinize emin misiniz?')) {
                    this.deleteSupplier(id, card);
                }
            });
        });
    },

    /**
     * AJAX: Durum Değiştir
     */
    toggleSupplierStatus: async function (id, btnElement) {
        const icon = btnElement.querySelector('i');
        const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

        try {
            const response = await fetch(`/Suppliers/ToggleStatus?id=${id}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'RequestVerificationToken': csrfToken
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const isActive = result.isActive;

                    // UI Güncelleme
                    icon.className = isActive ? 'text-success' : 'text-muted';
                    btnElement.title = isActive ? 'Durdur' : 'Başlat';

                    const dot = document.getElementById(`dot-${id}`);
                    const badge = document.getElementById(`badge-${id}`);

                    if (dot) dot.className = `ws-status-dot ${isActive ? 'bg-success' : 'bg-secondary'}`;
                    if (badge) {
                        badge.className = `ws-status-text ${isActive ? 'text-success' : 'text-muted'}`;
                        badge.textContent = isActive ? 'Aktif' : 'Pasif';
                    }

                    this.initLucide();
                }
            }
        } catch (error) {
            console.error('Status Toggle Error:', error);
        }
    },

    /**
     * AJAX: Soft Delete
     */
    deleteSupplier: async function (id, cardElement) {
        const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

        try {
            const response = await fetch(`/Suppliers/SoftDelete?id=${id}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'RequestVerificationToken': csrfToken
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    cardElement.style.transform = 'scale(0.95)';
                    cardElement.style.opacity = '0';
                    setTimeout(() => cardElement.remove(), 300);

                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Başarılı', 'Tedarikçi arşive kaldırıldı.', 'success');
                    }
                }
            }
        } catch (error) {
            console.error('Delete Error:', error);
        }
    },

    /**
     * Utility: Debounce
     */
    debounce: function (func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Utility: Tarih Ayrıştırıcı (tr)
     */
    parseTurkishDate: function (dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
};
