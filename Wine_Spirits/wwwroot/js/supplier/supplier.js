/**
 * @description Tedarikçi Yönetimi AJAX, Modal ve Filtreleme İşlemleri
 */

document.addEventListener('DOMContentLoaded', () => {
    initActionEvents();
    initSearchAndFilters();
    initFlatpickr(); // Takvimi başlat
});

// Modal referansını global tanımlayalım
const supplierModalElement = document.getElementById('supplierModal');
const supplierModal = supplierModalElement ? new bootstrap.Modal(supplierModalElement) : null;
const modalContent = document.getElementById('supplierModalContent');

/**
 * BUTON VE FORM OLAYLARI
 */
function initActionEvents() {
    // YENİ EKLE BUTONU
    const btnCreate = document.getElementById('btnCreateSupplier');
    btnCreate?.addEventListener('click', () => loadModalContent('/Suppliers/Create'));

    // DÜZENLE VE DURUM DEĞİŞTİRME (Event Delegation)
    document.addEventListener('click', async (e) => {
        // Düzenle
        const editBtn = e.target.closest('.btn-edit-supplier');
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            loadModalContent(`/Suppliers/Edit/${id}`);
        }

        // Durum Toggle (Aktif/Pasif)
        const toggleBtn = e.target.closest('.btn-toggle-status');
        if (toggleBtn) {
            const id = toggleBtn.getAttribute('data-id');
            await toggleSupplierStatus(id);
        }
    });

    // FORM SUBMIT (Kaydet Butonu)
    document.addEventListener('submit', (e) => {
        if (e.target && e.target.id === 'supplierForm') {
            e.preventDefault();
            submitSupplierForm(e.target);
        }
    });
}

/**
 * FİLTRELEME VE ARAMA İŞLEMLERİ
 */
function initSearchAndFilters() {
    const searchInput = document.getElementById('supplierSearch');
    searchInput?.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        // Tablo satırı yerine kartları seçiyoruz
        const cards = document.querySelectorAll('.supplier-card-item');

        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(keyword) ? '' : 'none';
        });
    });
}

/**
 * FLATPICKR (TAKVİM) BAŞLATMA
 */
function initFlatpickr() {
    const dateInput = document.getElementById('dateFilter');
    if (dateInput && typeof flatpickr !== 'undefined') {
        flatpickr(dateInput, {
            mode: "range",
            dateFormat: "d.m.Y",
            locale: "tr",
            onChange: function (selectedDates, dateStr) {
                console.log("Seçilen Tarih Aralığı:", dateStr);
                // Burada tarih bazlı tablo filtreleme mantığı eklenebilir
            }
        });
    }
}

/**
 * DROPDOWN FİLTRELEME FONKSİYONLARI (HTML onclick'ler için)
 */
window.filterStatus = function (status, text) {
    const statusText = document.getElementById('selectedStatusText');
    if (statusText) statusText.innerText = text;

    const rows = document.querySelectorAll('#suppliersTableBody tr');
    rows.forEach(row => {
        const badge = row.querySelector('.ws-status-badge');
        if (!status) {
            row.style.display = '';
        } else {
            const isActive = badge.classList.contains('active');
            if (status === 'active') row.style.display = isActive ? '' : 'none';
            if (status === 'passive') row.style.display = !isActive ? '' : 'none';
        }
    });
};

/**
 * MODAL VE FORM YÖNETİMİ (AJAX)
 */
async function loadModalContent(url) {
    try {
        const response = await fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (response.ok) {
            const html = await response.text();
            modalContent.innerHTML = html;
            supplierModal.show();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch (error) {
        console.error('Modal yükleme hatası:', error);
    }
}

async function submitSupplierForm(form) {
    const formData = new FormData(form);
    const url = form.getAttribute('action') || (formData.get('Id') === '00000000-0000-0000-0000-000000000000' ? '/Suppliers/Create' : '/Suppliers/Edit');

    try {
        const response = await fetch(url, {
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
            // Hata varsa partialView döner (Validation mesajları için)
            modalContent.innerHTML = await response.text();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch (error) {
        console.error('Form gönderme hatası:', error);
    }
}

async function toggleSupplierStatus(id) {
    try {
        const response = await fetch(`/Suppliers/ToggleStatus/${id}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            location.reload(); // En güvenli yol tabloyu yenilemek
        }
    } catch (error) {
        console.error('Durum değiştirme hatası:', error);
    }
}