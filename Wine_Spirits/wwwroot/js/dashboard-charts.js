/**
 * DashboardManager - Yönetim Paneli Grafik Yönetim Nesnesi (V3 Premium)
 * Bu nesne, Chart.js kütüphanesini kullanarak verileri görselleştirir.
 */
const DashboardManager = {
    // Grafik referanslarını saklamak için
    charts: {
        category: null,
        country: null,
        stockTrend: null
    },

    /**
     * Dashboard'u başlatır ve grafikleri oluşturur.
     * @param {Object} data - Backend'den gelen veriler.
     */
    init: function (data) {
        console.log("DashboardManager V3 Başlatıldı:", data);

        // Grafiklerin çizilmesi
        this.createCategoryChart(data.categoryLabels || [], data.categoryValues || []);
        this.createCountryChart(data.countryLabels || [], data.countryValues || []);
        this.createStockTrendChart(data.stockTrendLabels || [], data.stockTrendValues || []);
    },

    /**
     * Kategori bazlı dağılım grafiğini (Doughnut) oluşturur.
     */
    createCategoryChart: function (labels, values) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#cbd5e1'
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
                        labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
                    }
                },
                cutout: '75%'
            }
        });
    },

    /**
     * Ülke bazlı dağılım grafiğini (Bar) oluşturur.
     */
    createCountryChart: function (labels, values) {
        const ctx = document.getElementById('countryChart');
        if (!ctx) return;

        const ctx2d = ctx.getContext('2d');
        let barGradient = ctx2d.createLinearGradient(0, 0, 0, 300);
        barGradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        barGradient.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

        this.charts.country = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ürün Sayısı',
                    data: values,
                    backgroundColor: barGradient,
                    borderColor: '#4f46e5',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    },

    /**
     * Stok Trend Grafiği (V3 Yeni - StockMovement Bazlı)
     */
    createStockTrendChart: function (labels, values) {
        const ctx = document.getElementById('stockTrendChart');
        if (!ctx) return;

        const ctx2d = ctx.getContext('2d');
        let trendGradient = ctx2d.createLinearGradient(0, 0, 0, 150);
        trendGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        trendGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        this.charts.stockTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stok Değişimi',
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: trendGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, maxRotation: 0 }
                    }
                }
            }
        });
    }
};

// Sayfa yüklendiğinde başlat (Veri kontrolü window.dashboardData üzerinden)
document.addEventListener('DOMContentLoaded', function () {
    if (window.dashboardData) {
        DashboardManager.init(window.dashboardData);
    }
});
