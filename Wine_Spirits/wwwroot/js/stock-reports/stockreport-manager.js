/**
 * Stock Report Module - Data & Filter Handling
 * Senin ProductManager mimarine göre revize edildi.
 */
const ReportManager = {
    allData: [],
    filteredData: [],
    currentFilters: { search: "", warehouse: "all", status: "all", dateRange: "" },

    init: function () {
        this.loadReports();
        this.attachEvents();
        this.initDateRange();
    },

    // 1. Veriyi Getir (Endpoint adını projenine göre güncelle: örn: /StockReport/GetReportData)
    loadReports: function () {
        // Controller adın StockReports olduğu için buraya da 's' ekledik
        fetch('/StockReports/GetReportData', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(res => {
                this.allData = res.data || [];
                this.filteredData = [...this.allData];
                this.renderTable(this.filteredData);
            })
            .catch(err => console.error("Veri çekilemedi. Hata:", err));
    }, 

    // 2. Tabloyu Dinamik Oluştur
    renderTable: function (data) {
        const tableBody = document.querySelector('#reportTable tbody');
        if (!tableBody) return;

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="ws-text-center py-5 text-muted">Kayıt bulunamadı.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(item => {
            const priceStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.unitPrice || 0);
            const totalStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.totalValue || 0);
            const isCritical = item.stockQuantity <= item.criticalLevel;

            return `
            <tr>
                <td>
                    <div class="ws-td-main-text">${item.productName}</div>
                    <div class="ws-td-sub-text">ID: #${item.productCode}</div>
                </td>
                <td><span class="ws-tag">${item.categoryName}</span></td>
                <td>${item.warehouseName}</td>
                <td><span class="ws-td-bold ${isCritical ? 'ws-text-danger' : ''}">${item.stockQuantity} ${item.unit}</span></td>
                <td>${priceStr}</td>
                <td class="ws-td-bold">${totalStr}</td>
                <td class="ws-text-center">
                    <span class="ws-status-pill ${isCritical ? 'ws-status-danger' : 'ws-status-success'}">
                        <i data-lucide="${isCritical ? 'alert-circle' : 'check-circle'}"></i> 
                        ${isCritical ? 'Kritik' : 'Yeterli'}
                    </span>
                </td>
            </tr>`;
        }).join('');

        // Toplam satırını (Footer) güncelle
        this.updateFooter(data);
        GlobalUI?.refreshLucide();
    },

    // 3. Tablo Altı Toplam Hesaplama
    updateFooter: function (data) {
        const totalQty = data.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
        const totalVal = data.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        const totalValStr = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalVal);

        const footer = document.querySelector('.ws-table-footer');
        if (footer) {
            footer.innerHTML = `
                <tr>
                    <td colspan="3">GENEL TOPLAM</td>
                    <td class="ws-text-primary">${totalQty} Birim</td>
                    <td>—</td>
                    <td class="ws-text-primary">${totalValStr}</td>
                    <td></td>
                </tr>`;
        }
    },

    // 4. Flatpickr "Range" Ayarı
    initDateRange: function () {
        const dateInput = document.getElementById('reportDateRange');
        if (!dateInput) return;

        flatpickr(dateInput, {
            mode: "range",
            locale: "tr",
            dateFormat: "d.m.Y",
            showMonths: 2,
            onClose: (selectedDates, dateStr, instance) => {
                if (selectedDates.length === 2) {
                    this.currentFilters.dateRange = dateStr;
                    instance.element.closest('.ws-filter-item')?.classList.add('is-active');
                    this.applyFilters();
                }
            }
        });
    },

    // 5. Filtre Uygulama Mantığı
    applyFilters: function () {
        const s = document.getElementById('reportSearch')?.value.toLowerCase() || "";
        const w = this.currentFilters.warehouse;
        const st = this.currentFilters.status;

        this.filteredData = this.allData.filter(item => {
            const matchesSearch = item.productName.toLowerCase().includes(s) || item.productCode.toLowerCase().includes(s);
            const matchesWarehouse = w === "all" || item.warehouseName === w;
            const matchesStatus = st === "all" || (st === "critical" ? item.stockQuantity <= item.criticalLevel : item.stockQuantity > item.criticalLevel);

            return matchesSearch && matchesWarehouse && matchesStatus;
        });

        this.renderTable(this.filteredData);
    },

    attachEvents: function () {
        document.getElementById('reportSearch')?.addEventListener('input', () => this.applyFilters());

        // Excel İndirme
        document.getElementById('btnDownloadReport')?.addEventListener('click', () => {
            Swal.fire('Bilgi', 'Excel raporu oluşturuluyor...', 'info');
        });
    },

    // HTML onclick olayları için dışarıya açılan metodlar
    updateWarehouse: function (val) {
        this.currentFilters.warehouse = val;
        document.getElementById('selectedWarehouse').innerText = (val === 'all' ? 'Tüm Depolar' : val);
        this.applyFilters();
    },

    updateSort: function (status) {
        this.currentFilters.status = status;
        this.applyFilters();
    }
};

document.addEventListener('DOMContentLoaded', () => ReportManager.init());