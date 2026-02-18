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
        // --- Yeni Hareket Modalı Açma ---
        const btnNewMovement = document.getElementById('btnNewMovement');
        if (btnNewMovement) {
            btnNewMovement.addEventListener('click', () => {
                const modalElement = document.getElementById('newMovementModal');
                if (modalElement) {
                    new bootstrap.Modal(modalElement).show();
                }
            });
        }

        // --- Form Gönderimi ---
        const formMovement = document.getElementById('formNewMovement');
        if (formMovement) {
            formMovement.addEventListener('submit', (e) => {
                e.preventDefault();
                const modalElement = document.getElementById('newMovementModal');
                const instance = bootstrap.Modal.getInstance(modalElement);
                if (instance) instance.hide();
            });
        }

        // --- Sıralama Seçenekleri ---
        const sortItems = document.querySelectorAll('[data-sort]');
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sortItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                console.log('Sıralama:', item.getAttribute('data-sort'));
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StockMovementManager.init();
});
