/**
 * Müşteri Yönetimi (CRM) Modülü Script Dosyası
 * Konum: wwwroot/js/customer/customer.js
 * Versiyon: 3.0 - Full Production Ready
 */

document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    initDatePicker();
    initSearch();
    initGlobalEvents();

    console.log('CRM Module Initialized: /js/customer/customer.js');
});

// 1. UI BİLEŞENLERİNİ BAŞLAT (Lucide & Flatpickr)
function initLucide() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initDatePicker() {
    const dateInput = document.querySelector("#filterDate");
    if (typeof flatpickr !== 'undefined' && dateInput) {
        flatpickr(dateInput, {
            locale: "tr",
            mode: "range",
            dateFormat: "d.m.Y",
            allowInput: false,
            clickOpens: true,
            disableMobile: true,
            onClose: function (selectedDates, dateStr) {
                if (dateStr) filterTable();
            }
        });
    }
}

// 2. MERKEZİ OLAY YÖNETİMİ (Event Delegation)
function initGlobalEvents() {
    document.addEventListener('click', async function (e) {

        // A. YENİ MÜŞTERİ EKLE (Ajax Modal)
        const createBtn = e.target.closest('#btnCreateCustomer');
        if (createBtn) {
            e.preventDefault();
            const modalElement = document.getElementById('createCustomerModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                const modalContent = modalElement.querySelector('.modal-content');

                // Loader
                modalContent.innerHTML = `
                    <div class="p-5 text-center">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted fw-medium">Müşteri formu hazırlanıyor...</p>
                    </div>`;
                // customer.js içinde ilgili kısmı şu şekilde güncelle:
                const modalDialog = modalElement.querySelector('.modal-dialog');
                modalDialog.classList.remove('modal-lg'); // Çok geniş olanı kaldır
                modalDialog.classList.add('modal-md');    // Orta boy (daha estetik) ekle
                modalDialog.classList.add('modal-dialog-centered');
                modal.show();

                try {
                    const response = await fetch('/Customers/Create', {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    });
                    if (!response.ok) throw new Error('Yükleme hatası');
                    const html = await response.text();
                    modalContent.innerHTML = html;
                    initLucide();
                    initFormEvents();
                } catch (err) {
                    modalContent.innerHTML = '<div class="alert alert-danger m-3">Form yüklenemedi.</div>';
                }
            }
        }

        // B. DURUM DEĞİŞTİRME (Toggle Status)
        const toggleBtn = e.target.closest('.btn-toggle-status');
        if (toggleBtn) {
            const id = toggleBtn.getAttribute('data-id');
            toggleCustomerStatus(id, toggleBtn);
        }

        // C. SİLME (Soft Delete)
        const deleteBtn = e.target.closest('.btn-delete-customer');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            // SweetAlert2 varsa kullan, yoksa standart confirm
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Emin misiniz?',
                    text: "Bu müşteri kaydı silinecektir.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Evet, Sil',
                    cancelButtonText: 'İptal'
                }).then((result) => {
                    if (result.isConfirmed) deleteCustomer(id, deleteBtn.closest('tr'));
                });
            } else if (confirm('Müşteriyi silmek istediğinize emin misiniz?')) {
                deleteCustomer(id, deleteBtn.closest('tr'));
            }
        }
    });
}

// 3. AJAX İŞLEMLERİ
async function toggleCustomerStatus(id, btnElement) {
    try {
        const response = await fetch(`/Customers/ToggleStatus/${id}`, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const isActive = result.isActive;
                const badge = document.getElementById(`badge-${id}`);
                if (badge) {
                    badge.className = `ws-badge ${isActive ? 'ws-badge-soft-green' : 'ws-badge-soft-passive'}`;
                    badge.innerHTML = `<i data-lucide="${isActive ? 'check-circle' : 'minus-circle'}" class="ws-icon-16"></i> ${isActive ? 'Aktif' : 'Pasif'}`;
                }
                const icon = btnElement.querySelector('i');
                if (icon) {
                    icon.className = `ws-icon-16 lucide lucide-power ${isActive ? 'btn-status-active' : 'btn-status-passive'}`;
                }
                initLucide();
            }
        }
    } catch (error) { console.error('Status Error:', error); }
}

async function deleteCustomer(id, row) {
    try {
        const response = await fetch(`/Customers/Delete/${id}`, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                row.style.transition = 'all 0.4s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(20px)';
                setTimeout(() => row.remove(), 400);
            }
        }
    } catch (error) { console.error('Delete Error:', error); }
}

// 4. FORM YÖNETİMİ
function initFormEvents() {
    const createForm = document.getElementById('createCustomerForm');
    if (!createForm) return;

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createForm);
        const submitBtn = createForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> İşleniyor...';

        try {
            const response = await fetch('/Customers/Create', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                    return;
                }
            }

            // Hata varsa (Validasyon) partial'ı tekrar yükle
            const html = await response.text();
            document.querySelector('#createCustomerModal .modal-content').innerHTML = html;
            initLucide();
            initFormEvents();
        } catch (error) {
            console.error('Submit Error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// 5. FİLTRELEME VE ARAMA
function filterTable() {
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const dateInput = document.querySelector("#filterDate");
    const dateRangeStr = dateInput?.value || '';

    const rows = document.querySelectorAll('#customersTableBody tr');

    let startDate = null, endDate = null;
    if (dateRangeStr.includes(' — ')) {
        const parts = dateRangeStr.split(' — ');
        startDate = parseTurkishDate(parts[0]);
        endDate = parseTurkishDate(parts[1]);
    } else if (dateRangeStr) {
        startDate = parseTurkishDate(dateRangeStr);
        endDate = startDate;
    }

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(searchTerm);

        const badgeText = row.querySelector('.ws-badge')?.textContent.toLowerCase() || '';
        const rowStatus = badgeText.includes('aktif') ? 'active' : 'inactive';
        const matchesStatus = (status === '') || (status === rowStatus);

        let matchesDate = true;
        const rowDateStr = row.getAttribute('data-date');
        if (rowDateStr && (startDate || endDate)) {
            const rowDate = new Date(rowDateStr);
            rowDate.setHours(0, 0, 0, 0);
            if (startDate && rowDate < startDate) matchesDate = false;
            if (endDate && rowDate > endDate) matchesDate = false;
        }

        row.style.display = (matchesSearch && matchesStatus && matchesDate) ? '' : 'none';
    });
}

function parseTurkishDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.trim().split('.');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function initSearch() {
    const searchInput = document.getElementById('customerSearch');
    const statusFilter = document.getElementById('filterStatus');
    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (statusFilter) statusFilter.addEventListener('change', filterTable);
}