/**
 * DashboardPremium Object: Figma tasarımlarına uygun gelişmiş grafik ve UI mantığı.
 * Bu dosya ana satış grafiğini, kategori renk eşleşmelerini ve premium etkileşimleri yönetir.
 */
const DashboardPremium = {
    charts: {},
    config: {
        colors: {
            sales: '#6366f1', // Indigo
            profit: '#10b981', // Emerald
            grid: '#f1f5f9'
        }
    },

    /**
     * Dashboard analitiklerini başlatır
     * @param {Object} data - ViewModel'den gelen analitik veriler
     */
    init: function (data) {
        console.log("DashboardPremium: Analitikler Başlatılıyor", data);
        this.renderSalesChart(data);
        this.applyCategoryColors(data.categoryColors);
        this.initTooltips();
    },

    /**
     * Aylık Satış ve Kâr grafiğini çizer (Double Line Chart)
     */
    renderSalesChart: function (data) {
        const ctx = document.getElementById('premiumSalesChart');
        if (!ctx) return;

        // Canvas üzerinde gradyanlar oluştur (Premium Figma Style)
        const ctx2d = ctx.getContext('2d');

        let salesGradient = ctx2d.createLinearGradient(0, 0, 0, 400);
        salesGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        salesGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        let profitGradient = ctx2d.createLinearGradient(0, 0, 0, 400);
        profitGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        profitGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        // Eğer veri yoksa boş dizi göster (Index.cshtml'deki no-data katmanı bunu ele alacak)
        const salesData = data.monthlySales || [];
        const profitData = data.monthlyProfit || [];
        const labels = data.monthlyLabels || [];

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Satışlar',
                        data: salesData,
                        borderColor: this.config.colors.sales,
                        backgroundColor: salesGradient,
                        fill: true,
                        tension: 0.45,
                        borderWidth: 4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: this.config.colors.sales,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: 'Kâr',
                        data: profitData,
                        borderColor: this.config.colors.profit,
                        backgroundColor: profitGradient,
                        fill: true,
                        tension: 0.45,
                        borderWidth: 4,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: this.config.colors.profit,
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top', align: 'end' },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        backgroundColor: '#1e293b',
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: this.config.colors.grid, drawBorder: false },
                        ticks: {
                            callback: value => new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(value)
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    },

    /**
     * Kategori bazlı renkleri UI elemanlarına (ikon arka planları vb.) uygular
     */
    applyCategoryColors: function (colorMap) {
        if (!colorMap) return;

        document.querySelectorAll('.js-category-icon').forEach(el => {
            const cat = el.getAttribute('data-category');
            if (colorMap[cat]) {
                el.style.backgroundColor = colorMap[cat] + '15'; // %15 opacity
                el.style.color = colorMap[cat];
            }
        });
    },

    /**
     * Bootstrap tooltips başlatma
     */
    initTooltips: function () {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(t => new bootstrap.Tooltip(t));
    }
};
