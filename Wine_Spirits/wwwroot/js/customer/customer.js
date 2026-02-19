/**
 * Müşteri Yönetimi (CRM) Modülü Script Dosyası
 * Global Standart: Inline script kullanımı yasaktır.
 */

document.addEventListener('DOMContentLoaded', () => {
    // GLOBAL: Lucide ikonlarını initialize et
    initLucide();

    // GLOBAL: Flatpickr Tarih Seçici Başlatma (image_8b8edf.png)
    initDatePicker();

    // Arama Fonksiyonu
    initSearch();

    // Event Listeners for Actions
    initActionEvents();

    // Form submission
    initFormEvents();

    console.log('CRM Module - Professional Standards Initialized');
});

// BURADA: Lucide ikonlarını başlatan yardımcı fonksiyon
function initLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// BURADA: Tarih seçiciyi başlatan fonksiyon (STANDART: Flatpickr Range Mode)
function initDatePicker() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr(".flatpickr-date", {
            locale: "tr",
            mode: "range",
            dateFormat: "d.m.Y",
            allowInput: true,
            disableMobile: true,
            onClose: function (selectedDates, dateStr, instance) {
                // BURADA: Seçim yapıldığında filtrelemeyi tetikle
                filterTable();
            }
        });
    }
}

// BURADA: Arama ve Filtreleme işlevselliği
function initSearch() {
    const searchInput = document.getElementById('customerSearch');
    const statusFilter = document.getElementById('filterStatus');

    if (searchInput) {
        searchInput.addEventListener('input', () => filterTable());
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => filterTable());
    }
}

// BURADA: Tüm filtreleri (Arama, Durum, Tarih) birleştiren merkezi fonksiyon
function filterTable() {
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const dateRangeStr = document.getElementById('filterDate')?.value || '';

    const rows = document.querySelectorAll('#customersTableBody tr');

    // Tarih aralığını ayrıştır (Flatpickr Range Mode: "dd.mm.yyyy [ayraç] dd.mm.yyyy")
    let startDate = null;
    let endDate = null;

    if (dateRangeStr.includes(' — ')) { // Flatpickr default separator
        const parts = dateRangeStr.split(' — ');
        startDate = parseTurkishDate(parts[0]);
        endDate = parseTurkishDate(parts[1]);
    } else if (dateRangeStr.length === 10) { // Single date
        startDate = parseTurkishDate(dateRangeStr);
        endDate = startDate;
    }

    rows.forEach(row => {
        // 1. Arama metni kontrolü
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(searchTerm);

        // 2. Durum kontrolü
        const rowStatusBadge = row.querySelector('.ws-badge');
        let rowStatusValue = '';
        if (rowStatusBadge) {
            rowStatusValue = rowStatusBadge.textContent.toLowerCase().includes('aktif') ? 'active' : 'inactive';
        }
        const matchesStatus = status === '' || (status === 'active' && rowStatusValue === 'active') || (status === 'inactive' && rowStatusValue === 'inactive');

        // 3. Tarih Aralığı Kontrolü (data-date attribute üzerinden)
        let matchesDate = true;
        const rowDateStr = row.getAttribute('data-date'); // "yyyy-MM-dd"
        if (rowDateStr && (startDate || endDate)) {
            const rowDate = new Date(rowDateStr);
            rowDate.setHours(0, 0, 0, 0);

            if (startDate && rowDate < startDate) matchesDate = false;
            if (endDate && rowDate > endDate) matchesDate = false;
        }

        // Satır görünürlüğü: Tüm kriterler eşleşmeli
        if (matchesSearch && matchesStatus && matchesDate) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // BURADA: Tablodaki Lucide ikonlarının kaybolmaması için yeniden tetikleniyor
    initLucide();
}

// BURADA: DD.MM.YYYY formatındaki Türkçe tarihi JS Date nesnesine çeviren yardımcı fonksiyon
function parseTurkishDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    // Date(year, monthIndex, day)
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// BURADA: Tablo aksiyonları için listener'lar
function initActionEvents() {
    // Toggle Status
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            toggleCustomerStatus(id, this);
        });
    });

    // Delete Customer
    document.querySelectorAll('.btn-delete-customer').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (confirm('Müşteriyi silmek istediğinize emin misiniz?')) {
                deleteCustomer(id, this.closest('tr'));
            }
        });
    });
}

// BURADA: Müşteri Aktif/Pasif durumunu AJAX ile güncelleyen ana fonksiyon
async function toggleCustomerStatus(id, btnElement) {
    const icon = btnElement.querySelector('i');

    try {
        const response = await fetch(`/Customers/ToggleStatus?id=${id}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const isActive = result.isActive;

                // UI Güncelleme
                icon.className = `ws-icon-16 lucide lucide-power ${isActive ? 'btn-status-active' : 'btn-status-passive'}`;
                btnElement.title = isActive ? 'Pasife Al' : 'Aktife Al';

                const badge = document.getElementById(`badge-${id}`);
                if (badge) {
                    badge.className = `ws-badge ${isActive ? 'ws-badge-soft-green' : 'ws-badge-soft-passive'}`;
                    badge.innerHTML = `<i data-lucide="${isActive ? 'check-circle' : 'minus-circle'}" class="ws-icon-16"></i> ${isActive ? 'Aktif' : 'Pasif'}`;
                    initLucide();
                }
            }
        }
    } catch (error) {
        console.error('Toggle Error:', error);
    }
}

// BURADA: Müşteriyi AJAX ile soft-delete yapan fonksiyon
async function deleteCustomer(id, rowElement) {
    try {
        const response = await fetch(`/Customers/Delete?id=${id}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Satırı pürüzsüzce kaldır
                rowElement.style.transition = 'opacity 0.3s ease';
                rowElement.style.opacity = '0';
                setTimeout(() => rowElement.remove(), 300);
            }
        }
    } catch (error) {
        console.error('Delete Error:', error);
    }
}

// BURADA: Form gönderimini yöneten fonksiyon
function initFormEvents() {
    const createForm = document.getElementById('createCustomerForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(createForm);

            try {
                const response = await fetch('/Customers/Create', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
}
