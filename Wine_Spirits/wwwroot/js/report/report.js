/**
 * Stock Report Manager
 * Filtreleme, sıralama ve rapor indirme etkileşimlerini yönetir.
 */
const StockReportManager = {
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
        const dateInput = document.getElementById('reportDateRange');
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
        // --- Sıralama Seçenekleri ---
        const sortItems = document.querySelectorAll('[data-sort]');
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sortItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                console.log('Rapor sıralaması:', item.getAttribute('data-sort'));
            });
        });

        // --- Rapor İndir ---
        const btnDownload = document.getElementById('btnDownloadReport');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                console.log('Rapor indiriliyor...');
                // Backend entegrasyonu buraya eklenecek
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StockReportManager.init();
});
