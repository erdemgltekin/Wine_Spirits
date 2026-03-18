/**
 * Stock Movement Manager
 * Flatpickr tarih seçici, modal ve sıralama etkileşimlerini yönetir.
 */
const StockMovementManager = {
    init: function () {
        this.initializeIcons();
        this.initializeDatepicker();
        this.attachEvents();
    },

    initializeIcons: function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    initializeDatepicker: function () {
        const dateInput = document.getElementById('dateFilter');
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

    attachEvents: function () {
        // Modal and form submission are now handled by GlobalUI.openModal
        console.log("StockMovementManager: UI events attached.");
    },

    deleteMovement: function (id) {
        Swal.fire({
            title: 'Hareketi silmek istediğinize emin misiniz?',
            text: "Bu işlem geri alınamaz!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        }).then((result) => {
            if (result.isConfirmed) {
                $.post('/StockMovement/Delete/' + id, function (res) {
                    window.location.reload();
                });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StockMovementManager.init();
});

/**
 * Filtre Seçimlerini Güncelle
 */
function updateFilter(type, value) {
    if (type === 'MovementType') {
        document.getElementById('selectedMovementType').innerText = value;
    } else if (type === 'Warehouse') {
        document.getElementById('selectedWarehouse').innerText = value;
    }

    // Aktiflik sınıfını güncelle (UI Feedback)
    const dropdownItems = event.target.closest('.dropdown-menu').querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');

    console.log(`${type} Filtresi Uygulandı: ${value}`);
    // Buraya tabloyu yenileyecek AJAX fonksiyonunu bağlayabiliriz.
}

// Global erişim için window objesine bağla
window.updateFilter = updateFilter;