/**
 * @description Tedarikçi Yönetimi AJAX, Modal ve Filtreleme İşlemleri
 */
document.addEventListener('DOMContentLoaded', () => {
    initActionEvents();
    initSearchAndFilters();
    initFlatpickr();
});

const supplierModalElement = document.getElementById('supplierModal');
const supplierModal = supplierModalElement ? new bootstrap.Modal(supplierModalElement) : null;
const modalContent = document.getElementById('supplierModalContent');

function initActionEvents() {
    // YENİ EKLE
    $(document).on('click', '#btnCreateSupplier', function () {
        loadModalContent('/Suppliers/Create');
    });

    // DÜZENLE VE DURUM (Event Delegation)
    $(document).on('click', '.btn-edit-supplier', function () {
        const id = $(this).data('id');
        loadModalContent(`/Suppliers/Edit/${id}`);
    });

    $(document).on('click', '.btn-toggle-status', async function () {
        const id = $(this).data('id');
        await toggleSupplierStatus(id);
    });

    // FORM SUBMIT
    $(document).on('submit', '#supplierForm', function (e) {
        e.preventDefault();
        submitSupplierForm(this);
    });
}

function initSearchAndFilters() {
    $('#supplierSearch').on('input', function () {
        const keyword = $(this).val().toLowerCase();
        $('.supplier-card-item').each(function () {
            const text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(keyword));
        });
    });
}

function initFlatpickr() {
    const dateInput = document.getElementById('dateFilter');
    if (dateInput && typeof flatpickr !== 'undefined') {
        flatpickr(dateInput, { mode: "range", dateFormat: "d.m.Y", locale: "tr" });
    }
}

// SELECT2 BAŞLATICI (Modal içindeki çakışmayı önlemek için dropdownParent şart)
function initModalSelect2() {
    if ($.fn.select2) {
        $('.select2-enable').select2({
            dropdownParent: $('#supplierModal'),
            width: '100%',
            placeholder: 'Seçiniz...'
        });
    }
}

async function loadModalContent(url) {
    try {
        const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (response.ok) {
            const html = await response.text();
            modalContent.innerHTML = html;

            // Önce ikonları, sonra Select2'yi ayağa kaldır
            if (typeof lucide !== 'undefined') lucide.createIcons();
            initModalSelect2();

            supplierModal.show();
        }
    } catch (error) {
        console.error('Modal yükleme hatası:', error);
    }
}

async function submitSupplierForm(form) {
    const formData = new FormData(form);
    const actionUrl = $(form).attr('action');

    try {
        const response = await fetch(actionUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (response.headers.get("content-type")?.includes("application/json")) {
            const result = await response.json();
            if (result.success) {
                supplierModal.hide();
                Swal.fire({ icon: 'success', title: 'Başarılı!', text: 'Kaydedildi.', timer: 1000, showConfirmButton: false })
                    .then(() => location.reload());
            }
        } else {
            // Validation hatası dönerse partialView'ı güncelle ve tekrar init et
            modalContent.innerHTML = await response.text();
            if (typeof lucide !== 'undefined') lucide.createIcons();
            initModalSelect2();
        }
    } catch (error) {
        console.error('Form gönderme hatası:', error);
    }
}

async function toggleSupplierStatus(id) {
    try {
        const response = await fetch(`/Suppliers/ToggleStatus/${id}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) location.reload();
    } catch (error) {
        console.error('Durum hatası:', error);
    }
}