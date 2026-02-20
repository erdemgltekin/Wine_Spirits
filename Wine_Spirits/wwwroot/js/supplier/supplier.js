/**
 * @file supplier.js
 * @description Premium V3 Tedarikçi Yönetimi Script Dosyası
 * @global Standards: No inline scripts, robust error handling, AJAX integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    initDatePicker();
    initSearchAndFilters();
    initActionEvents();
});

function initLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Flatpickr (Tarih Aralığı) yapılandırması
 */
function initDatePicker() {
    if (typeof flatpickr !== 'undefined' && document.querySelector(".flatpickr-date")) {
        flatpickr(".flatpickr-date", {
            locale: "tr",
            mode: "range",
            dateFormat: "d.m.Y",
            allowInput: true,
            disableMobile: true,
            onClose: () => filterCards()
        });
    }
}

/**
 * Arama ve Filtreleme İşlemleri
 */
function initSearchAndFilters() {
    const searchInput = document.getElementById('supplierSearch');
    const countryFilter = document.getElementById('filterCountry');
    const statusFilter = document.getElementById('filterStatus');

    searchInput?.addEventListener('input', debounce(() => filterCards(), 300));
    countryFilter?.addEventListener('change', () => filterCards());
    statusFilter?.addEventListener('change', () => filterCards());
}

/**
 * Kartları arama ve filtrelere göre gizle/göster
 */
function filterCards() {
    const searchTerm = document.getElementById('supplierSearch')?.value.toLowerCase() || '';
    const selectedCountry = document.getElementById('filterCountry')?.value.toLowerCase() || '';
    const statusValue = document.getElementById('filterStatus')?.value || '';
    const dateRangeStr = document.getElementById('filterDate')?.value || '';

    const cards = document.querySelectorAll('#suppliersCardContainer .ws-supplier-card-wrapper');

    let startDate = null;
    let endDate = null;

    if (dateRangeStr.includes(' — ')) {
        const parts = dateRangeStr.split(' — ');
        startDate = parseTurkishDate(parts[0]);
        endDate = parseTurkishDate(parts[1]);
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
}

/**
 * Event Listener'ları bağla
 */
function initActionEvents() {
    // Aktif/Pasif Değişimi
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            toggleSupplierStatus(id, this);
        });
    });

    // Silme (Arşivleme)
    document.querySelectorAll('.btn-delete-supplier').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const card = this.closest('.ws-supplier-card-wrapper');

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
                    deleteSupplier(id, card);
                }
            });
        });
    });
}

/**
 * AJAX: Durum Değiştir
 */
async function toggleSupplierStatus(id, btnElement) {
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

                // Lucide ikonlarını tazele
                initLucide();
            }
        }
    } catch (error) {
        console.error('Status Toggle Error:', error);
    }
}

/**
 * AJAX: Soft Delete
 */
async function deleteSupplier(id, cardElement) {
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

                Swal.fire('Başarılı', 'Tedarikçi arşive kaldırıldı.', 'success');
            }
        }
    } catch (error) {
        console.error('Delete Error:', error);
    }
}

/**
 * Utility: Debounce
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Utility: Tarih Ayrıştırıcı (tr)
 */
function parseTurkishDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}
