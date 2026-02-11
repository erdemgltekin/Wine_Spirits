/**
 * DashboardPremium: Analitik Görselleştirme Motoru
 */
const DashboardPremium = {
    charts: {},
    config: {
        colors: {
            sales: '#6366f1', profit: '#10b981',
            grid: '#f1f5f9', text: '#64748b'
        }
    },

    init: function (data) {
        if (!data) return;
        console.log("DashboardPremium: Motor Ateşleniyor...", data);

        // Önceki grafikleri temizle
        this.destroyCharts();

        // Grafiklerini çiz
        this.renderSalesChart(data);
        this.renderCategoryChart(data);
        this.renderCountryChart(data);

        if (data.categoryColors) {
            this.applyCategoryColors(data.categoryColors);
        }
    },

    renderSalesChart: function (data) {
        const canvas = document.getElementById('premiumSalesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        this.charts['sales'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.months || [],
                datasets: [
                    {
                        label: 'Satışlar',
                        data: data.salesData || [],
                        borderColor: this.config.colors.sales,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 2
                    },
                    {
                        label: 'Kâr',
                        data: data.profitData || [],
                        borderColor: this.config.colors.profit,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: this.config.colors.grid }, ticks: { color: this.config.colors.text } },
                    x: { grid: { display: false }, ticks: { color: this.config.colors.text } }
                }
            }
        });
    },

    renderCategoryChart: function (data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx || !data.categoryLabels) return;
        this.charts['cat'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.categoryLabels,
                datasets: [{
                    data: data.categoryData,
                    backgroundColor: Object.values(data.categoryColors || {}),
                    borderWidth: 0
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }
        });
    },

    renderCountryChart: function (data) {
        const ctx = document.getElementById('countryChart');
        if (!ctx || !data.countryLabels) return;
        this.charts['country'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.countryLabels,
                datasets: [{
                    label: 'Ciro',
                    data: data.countryData,
                    backgroundColor: '#6366f1',
                    borderRadius: 4
                }]
            },
            options: { maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
        });
    },

    applyCategoryColors: function (colorMap) {
        document.querySelectorAll('.js-category-icon').forEach(el => {
            const cat = el.getAttribute('data-category');
            if (colorMap[cat]) {
                el.style.backgroundColor = colorMap[cat] + '15';
                el.style.color = colorMap[cat];
            }
        });
    },

    destroyCharts: function () {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
    }
};