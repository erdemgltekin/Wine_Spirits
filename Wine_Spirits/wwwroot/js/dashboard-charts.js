/**
 * DashboardManager - Professional Edition
 *
 * YENİ ÖZELLİKLER:
 *   1. Dinamik Filtreleme  → changeRange(range)
 *   2. Excel Export         → exportToExcel()
 *   3. Loading State        → showLoading / hideLoading
 *   4. Last Updated         → updateTimestamp()
 *
 * MİMARİ KIRMIZI ÇİZGİLER:
 *   ✅ ws-stat + textContent korunuyor
 *   ✅ Tag Helper yapısı bozulmaz
 *   ✅ Tekil tablo isimleri backend'de
 */
const DashboardManager = {
    charts: { category: null, salesTrend: null },
    currentRange: 'all',

    init: function () {
        this.fetchDashboardData('all');
    },

    /* ================================================
       DİNAMİK FİLTRELEME
       ================================================ */
    changeRange: function (range) {
        this.currentRange = range;

        // Aktif buton stilini güncelle
        document.querySelectorAll('[data-range]').forEach(function (btn) {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-secondary');
        });
        var activeBtn = document.querySelector('[data-range="' + range + '"]');
        if (activeBtn) {
            activeBtn.classList.remove('btn-outline-secondary');
            activeBtn.classList.add('active', 'btn-primary');
        }

        this.fetchDashboardData(range);
    },

    fetchDashboardData: function (range) {
        var self = this;
        var url = '/Dashboard/GetDashboardData' + (range ? '?range=' + range : '');

        self.showLoading();

        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var d = self.normalize(data);

                self.updateStatCards(d);
                self.updateOrdersTable(d.recentOrders);
                self.renderCharts(d);
                self.updateTimestamp(d.serverTime);
                self.hideLoading();
            })
            .catch(function (err) {
                console.error('Dashboard hatası:', err);
                self.hideLoading();
            });
    },

    normalize: function (data) {
        return {
            totalProducts: data.totalProducts ?? data.TotalProducts ?? 0,
            totalStock: data.totalStock ?? data.TotalStock ?? 0,
            monthlySales: data.monthlySales ?? data.MonthlySales ?? 0,
            totalCiro: data.totalCiro ?? data.TotalCiro ?? 0,
            recentOrders: data.recentOrders ?? data.RecentOrders ?? [],
            months: data.months ?? data.Months ?? [],
            salesData: data.salesData ?? data.SalesData ?? [],
            categoryLabels: data.categoryLabels ?? data.CategoryLabels ?? [],
            categoryValues: data.categoryValues ?? data.CategoryValues ?? [],
            serverTime: data.serverTime ?? data.ServerTime ?? ''
        };
    },

    /* ================================================
       LOADING STATE
       ================================================ */
    showLoading: function () {
        document.querySelectorAll('.ws-stat-card').forEach(function (card) {
            card.classList.add('ws-loading');
        });
        var tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">'
                + '<div class="spinner-border spinner-border-sm text-primary" role="status"></div>'
                + '<div class="text-muted small mt-2">Veriler yükleniyor...</div>'
                + '</td></tr>';
        }
    },

    hideLoading: function () {
        document.querySelectorAll('.ws-stat-card').forEach(function (card) {
            card.classList.remove('ws-loading');
        });
    },

    /* ================================================
       LAST UPDATED TIMESTAMP
       ================================================ */
    updateTimestamp: function (serverTime) {
        var el = document.getElementById('lastUpdated');
        if (el) {
            var time = serverTime || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            el.textContent = 'Son Güncelleme: ' + time;
        }
    },

    /* ================================================
       STAT KARTLARI — textContent ile güvenli güncelleme
       ================================================ */
    updateStatCards: function (d) {
        this.setStat('totalProducts', d.totalProducts);
        this.setStat('totalStock', this.fmtNum(d.totalStock));
        this.setStat('monthlySales', this.fmtMoney(d.monthlySales));
        this.setStat('totalCiro', this.fmtMoney(d.totalCiro));
    },

    setStat: function (key, value) {
        var card = document.querySelector('[ws-stat="' + key + '"]');
        if (!card) return;
        var h4 = card.querySelector('.h4');
        if (h4) h4.textContent = value;
    },

    fmtNum: function (v) {
        return (v || 0).toLocaleString('tr-TR');
    },

    fmtMoney: function (v) {
        return '₺' + (v || 0).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /* ================================================
       SİPARİŞLER TABLOSU
       ================================================ */
    updateOrdersTable: function (orders) {
        var tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">Sipariş bulunamadı</td></tr>';
            return;
        }

        var self = this;
        var rows = '';
        for (var i = 0; i < orders.length; i++) {
            var o = orders[i];
            var id = o.id ?? o.Id ?? '?';
            var customerName = o.customerName ?? o.CustomerName ?? 'Bilinmiyor';
            var productName = o.productName ?? o.ProductName ?? 'Bilinmiyor';
            var quantity = o.quantity ?? o.Quantity ?? 0;
            var status = o.status ?? o.Status ?? 'Bekliyor';
            var total = o.total ?? o.Total ?? 0;
            var initial = customerName.charAt(0).toUpperCase();

            rows += '<tr>'
                + '<td class="fw-semibold text-indigo-600">#' + self.escHtml(id) + '</td>'
                + '<td>'
                + '<div class="d-flex align-items-center gap-2">'
                + '<div class="rounded-circle bg-light border d-flex align-items-center justify-content-center text-indigo-600 fw-bold" style="width:32px;height:32px;font-size:11px;">' + initial + '</div>'
                + '<span class="fw-medium" style="font-size:13px;">' + self.escHtml(customerName) + '</span>'
                + '</div>'
                + '</td>'
                + '<td class="text-muted" style="font-size:13px;">' + self.escHtml(productName) + '</td>'
                + '<td><span class="badge bg-light text-dark border">' + quantity + ' Adet</span></td>'
                + '<td><span class="badge bg-success-subtle text-success border border-success-subtle">' + self.escHtml(status) + '</span></td>'
                + '<td class="fw-bold text-dark text-nowrap">' + self.fmtMoney(total) + '</td>'
                + '<td class="text-end"><button class="btn btn-sm btn-outline-secondary">Detay</button></td>'
                + '</tr>';
        }
        tbody.innerHTML = rows;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    escHtml: function (t) {
        var d = document.createElement('div');
        d.textContent = t || '';
        return d.innerHTML;
    },

    /* ================================================
       EXCEL EXPORT (Client-Side, Sunucu Yükü Yok)
       ================================================ */
    exportToExcel: function () {
        var table = document.getElementById('ordersTableBody');
        if (!table) return;

        var rows = table.querySelectorAll('tr');
        if (rows.length === 0) return;

        // Tablo verisini HTML tablosuna dönüştür
        var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
        html += '<head><meta charset="utf-8"></head><body>';
        html += '<table border="1" style="border-collapse:collapse;">';

        // Başlık satırı
        html += '<tr>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">No</th>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">Müşteri</th>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">Ürün</th>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">Miktar</th>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">Durum</th>';
        html += '<th style="background:#4f46e5;color:#fff;padding:8px;">Tutar</th>';
        html += '</tr>';

        // Veri satırları
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].querySelectorAll('td');
            if (cells.length < 6) continue;

            html += '<tr>';
            html += '<td style="padding:6px;">' + (cells[0].textContent || '').trim() + '</td>';
            html += '<td style="padding:6px;">' + (cells[1].textContent || '').trim() + '</td>';
            html += '<td style="padding:6px;">' + (cells[2].textContent || '').trim() + '</td>';
            html += '<td style="padding:6px;">' + (cells[3].textContent || '').trim() + '</td>';
            html += '<td style="padding:6px;">' + (cells[4].textContent || '').trim() + '</td>';
            html += '<td style="padding:6px;">' + (cells[5].textContent || '').trim() + '</td>';
            html += '</tr>';
        }

        html += '</table></body></html>';

        // Blob ile indirme
        var blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'siparisler_' + new Date().toISOString().slice(0, 10) + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /* ================================================
       GRAFİKLER (Charts)
       ================================================ */
    /**
     * Tüm grafikleri (Satış ve Kategori) render eder.
     * @param {Object} d - Normalize edilmiş dashboard verisi.
     */
    renderCharts: function (d) {
        this.createCategoryChart(d.categoryLabels, d.categoryValues);
        this.createSalesChart(d.months, d.salesData);
    },

    /**
     * Dinamik Ürün Gamı Dağılımı (Doughnut Chart)
     * Backend'den gelen kategori isimlerini ve ürün adetlerini tam olarak yansıtır.
     * @param {Array} labels - Kategori isimleri.
     * @param {Array} values - Her kategorideki ürün adetleri.
     */
    createCategoryChart: function (labels, values) {
        var canvas = document.getElementById('categoryChart');
        if (!canvas || !labels || !values || labels.length === 0) return;
        if (this.charts.category) this.charts.category.destroy();

        this.charts.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#4f46e5', // Indigo
                        '#10b981', // Emerald
                        '#f59e0b', // Amber
                        '#ef4444', // Rose
                        '#8b5cf6', // Violet
                        '#06b6d4', // Cyan
                        '#f43f5e', // Pink
                        '#14b8a6', // Teal
                        '#3b82f6'  // Blue
                    ],
                    borderWidth: 0,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 11, family: "'Inter', sans-serif", weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 }
                    }
                },
                cutout: '72%' // Modern SaaS tarzı geniş boşluk
            }
        });
    },

    /**
     * Aylık Satış Trendi Grafiği (Line Chart)
     * @param {Array} labels - Ay isimleri.
     * @param {Array} values - Satış rakamları.
     */
    createSalesChart: function (labels, values) {
        var canvas = document.getElementById('premiumSalesChart');
        if (!canvas || !labels || !values || labels.length === 0) return;
        if (this.charts.salesTrend) this.charts.salesTrend.destroy();

        var ctx = canvas.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, 'rgba(79,70,229,0.2)');
        grad.addColorStop(1, 'rgba(79,70,229,0)');

        this.charts.salesTrend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performans (₺)',
                    data: values,
                    borderColor: '#4f46e5',
                    backgroundColor: grad,
                    fill: true,
                    tension: 0.45,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        callbacks: {
                            label: function (ctx) { return '₺' + ctx.raw.toLocaleString('tr-TR'); }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { callback: function (v) { return '₺' + v.toLocaleString('tr-TR'); }, font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }
};

/**
 * Sayfa yüklendiğinde Dashboard sistemini başlatır.
 */
document.addEventListener('DOMContentLoaded', function () {
    DashboardManager.init();
});
