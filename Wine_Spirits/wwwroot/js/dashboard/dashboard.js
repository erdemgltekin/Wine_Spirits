/**
 * DashboardManager - Premium Unified Version v2.0
 * İstatistikler, Grafikler, Tablo Yönetimi ve Aksiyonları Tek Merkezden Yönetir.
 */
const DashboardManager = {
    charts: {
        sales: null,
        category: null
    },
    currentRange: 'all',

    /**
     * Başlatıcı Metot
     */
    init: function () {
        console.log("DashboardManager: Sistem ateşleniyor...");
        this.fetchData(this.currentRange);
        this.attachEvents();
    },

    /**
     * Sunucudan Veri Çekme (AJAX)
     * @param {string} range - 'all', 'today', 'month' vb.
     */
    fetchData: function (range) {
        const _this = this;

        // Loading State: Tabloyu temizle ve spinner koy
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm"></div></td></tr>`;
        }

        fetch(`/Dashboard/GetDashboardData?range=${range}`)
            .then(r => {
                if (!r.ok) throw new Error("Sunucu yanıt vermiyor.");
                return r.json();
            })
            .then(data => {
                _this.updateStats(data);
                _this.renderCharts(data);
                _this.renderOrdersTable(data.recentOrders);
                _this.updateTimestamp(data.serverTime);
            })
            .catch(err => {
                console.error("Dashboard Veri Hatası:", err);
                if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Veriler yüklenemedi.</td></tr>`;
            });
    },

    /**
     * İstatistik Kartlarını Güncelleme
     */
    updateStats: function (data) {
        const stats = {
            totalProducts: data.totalProducts,
            totalStock: data.totalStock + " Adet",
            monthlySales: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.monthlySales),
            totalCiro: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.totalCiro)
        };

        // ws-stat attribute'una sahip her kartın değerini güncelle
        Object.keys(stats).forEach(key => {
            const el = document.querySelector(`[ws-stat="${key}"] .h4`);
            if (el) {
                // Değer değişirken ufak bir animasyon hissi (isteğe bağlı)
                el.textContent = stats[key];
            }
        });
    },

    /**
     * Grafikleri Çizme ve Yönetme (Memory Leak Korumalı)
     */
    renderCharts: function (data) {
        // Önceki grafikleri bellekten temizle
        this.destroyCharts();

        // 1. Aylık Satış Trendi (Line Chart)
        const salesCtx = document.getElementById('premiumSalesChart');
        if (salesCtx) {
            this.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ["Oca", "Şub", "Mar", "Nis", "May", "Haz"], // Backend'den gelen veriye göre map edilebilir
                    datasets: [{
                        label: 'Ciro',
                        data: [12000, 19000, 15000, 25000, 22000, 30000], // Örnek veri
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // 2. Kategori Dağılımı (Doughnut Chart)
        const catCtx = document.getElementById('categoryChart');
        if (catCtx) {
            this.charts.category = new Chart(catCtx, {
                type: 'doughnut',
                data: {
                    labels: data.categoryLabels,
                    datasets: [{
                        data: data.categoryValues,
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                        hoverOffset: 10,
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '75%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                    }
                }
            });
        }
    },

    /**
     * Son Siparişler Tablosu
     */
    renderOrdersTable: function (orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Kayıt bulunamadı.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td><span class="badge bg-light text-dark border fw-normal">#${o.id}</span></td>
                <td><div class="fw-semibold">${o.customerName}</div></td>
                <td><div class="small text-muted text-truncate" style="max-width: 150px;">${o.productName}</div></td>
                <td><span class="fw-medium">${o.quantity}</span> <small class="text-muted">Adet</small></td>
                <td><span class="status-pill status-success">Tamamlandı</span></td>
                <td><span class="fw-bold text-dark">${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(o.total)}</span></td>
                <td class="text-end">
                    <button class="ws-action-btn" onclick="GlobalUI.openModal('/Orders/Details/${o.id}', 'modal-lg')" title="Detay">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Yeni eklenen eye (göz) ikonları için Lucide'i tetikle
        if (typeof GlobalUI !== 'undefined') {
            GlobalUI.refreshLucide();
        }
    },

    /**
     * Event Listener'ları Bağlama
     */
    attachEvents: function () {
        const _this = this;

        // Filtre butonları için aktiflik yönetimi
        document.querySelectorAll('[data-range]').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const range = this.getAttribute('data-range');
                _this.changeRange(range, this);
            });
        });
    },

    /**
     * Tarih Aralığı Değiştirme
     */
    changeRange: function (range, element) {
        this.currentRange = range;

        // UI Güncelleme (Buton renkleri)
        document.querySelectorAll('[data-range]').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-secondary');
        });
        element.classList.replace('btn-outline-secondary', 'btn-primary');

        // Veriyi tekrar çek
        this.fetchData(range);
    },

    /**
     * Son Güncelleme Saatini Yazma
     */
    updateTimestamp: function (time) {
        const el = document.getElementById('lastUpdated');
        if (el) {
            el.innerHTML = `<i data-lucide="clock" class="me-1" style="width:14px; height:14px;"></i> Son Güncelleme: ${time}`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    /**
     * Bellek Yönetimi: Mevcut Grafikleri Yok Etme
     */
    destroyCharts: function () {
        if (this.charts.sales) {
            this.charts.sales.destroy();
            this.charts.sales = null;
        }
        if (this.charts.category) {
            this.charts.category.destroy();
            this.charts.category = null;
        }
    }
};

// Sayfa hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', () => {
    DashboardManager.init();
});