/**
 * Stock Report Manager
 */
const StockReportManager = {
    init: function () {
        this.initializeDatepicker();
        this.attachEvents();
    },

    initializeDatepicker: function () {
        const dateInput = document.querySelector('.ws-datepicker');
        if (dateInput && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput, {
                locale: 'tr',
                mode: 'range',
                dateFormat: 'd.m.Y',
                disableMobile: true,
                onClose: (selectedDates, dateStr) => {
                    if (dateStr) {
                        this.filterData(); // Tarih değişince filtrele
                    }
                }
            });
        }
    },

    // Yeni Dropdown için güncelleme metodu
    updateWarehouse: function (name) {
        const label = document.getElementById('selectedWarehouse');
        if (label) {
            label.innerText = name;
            console.log("Seçilen Depo:", name);
            this.filterData(); // Depo değişince filtrele
        }
    },

    // Merkezi filtreleme fonksiyonu (Simülasyon)
    filterData: function () {
        console.log("Filtreler uygulanıyor...");
        // Burada AJAX çağrısı veya tablo gizleme mantığı çalışacak
    },

    attachEvents: function () {
        // --- Rapor İndirme Butonu ---
        const btnDownload = document.getElementById('btnDownloadReport');
        if (btnDownload) {
            btnDownload.addEventListener('click', function () {
                const originalContent = this.innerHTML;
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Hazırlanıyor...';

                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = originalContent;
                    if (typeof UIHelper !== 'undefined') {
                        UIHelper.showToast("Rapor hazır, indiriliyor...", "check");
                    }
                }, 1500);
            });
        }

        // --- Tablo içi Canlı Arama ---
        const searchInput = document.getElementById('reportSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#reportTable tbody tr:not(.ws-report-summary-row)');
                rows.forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
                });
            });
        }
    }
};

// Globalden erişim gerekirse (HTML onclick için)
window.updateWarehouse = (name) => StockReportManager.updateWarehouse(name);

document.addEventListener('DOMContentLoaded', () => {
    StockReportManager.init();
});