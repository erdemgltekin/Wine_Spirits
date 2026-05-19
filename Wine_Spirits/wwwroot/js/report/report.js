/**
 * ============================================================
 *  WS REPORTS DASHBOARD — report.js
 *  Sorumluluk:
 *    1. /Reports/GetDashboardData API'sinden veri çek
 *    2. Chart.js ile Bar + Line grafiklerini oluştur
 *    3. Top Products & Top Customers listelerini DOM'a yaz
 *    4. Hızlı Rapor Modalı — dinamik filtre enjeksiyonu
 *    5. Grafik indirme, toast mesajı
 * ============================================================
 */

const ReportDashboard = (() => {

    // ─── Renk Paleti ──────────────────────────────────────────────────────
    const PALETTE = {
        red:    { border: '#c0392b', bg: 'rgba(192,57,43,0.85)'  },
        gold:   { border: '#d4a017', bg: 'rgba(212,160,23,0.85)' },
        rose:   { border: '#e91e8c', bg: 'rgba(233,30,140,0.85)' },
        purple: { border: '#7c3aed', bg: 'rgba(124,58,237,0.85)' },
    };

    // Chart örnekleri
    let _barChart  = null;
    let _lineChart = null;

    // Aktif modal rapor tipi
    let _activeReportType = null;
    let _currentStartDate = null;
    let _currentEndDate = null;

    // ─── Başlatıcı ────────────────────────────────────────────────────────
    function init() {
        _fetchDashboardData();
        _bindDownloadButtons();
        _bindQuickButtons();
        _bindModal();
        _bindDateFilter();
    }

    // =========================================================
    // BÖLÜM A — DASHBOARD VERİSİ & GRAFİKLER
    // =========================================================

    async function _fetchDashboardData() {
        try {
            let url = '/Reports/GetDashboardData';
            if (_currentStartDate && _currentEndDate) {
                url += `?startDate=${_currentStartDate}&endDate=${_currentEndDate}`;
            }
            const res  = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            _buildBarChart(data.labels, data.categorySales.datasets);
            _buildLineChart(data.labels, data.revenueTrend.datasets);
            _buildTopProductsList(data.topProducts);
            _buildTopCustomersList(data.topCustomers);
        } catch (err) {
            console.error('[ReportDashboard] Veri yüklenemedi:', err);
            _showLoadError();
        }
    }

    // ── Bar Chart ─────────────────────────────────────────────────────────
    function _buildBarChart(labels, datasets) {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;
        if (_barChart) _barChart.destroy();

        _barChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => ` ₺${_fmt(c.parsed.y)}` } }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#64748b' } },
                    y: {
                        grid: { color: 'rgba(148,163,184,0.15)' },
                        ticks: { font: { size: 11 }, color: '#64748b', callback: v => '₺' + _compactNum(v) }
                    }
                }
            }
        });
        _buildLegend('barLegend', datasets);
    }

    // ── Line Chart ────────────────────────────────────────────────────────
    function _buildLineChart(labels, datasets) {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;
        if (_lineChart) _lineChart.destroy();

        _lineChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => ` ₺${_fmt(c.parsed.y)}` } }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#64748b' } },
                    y: {
                        grid: { color: 'rgba(148,163,184,0.15)' },
                        ticks: { font: { size: 11 }, color: '#64748b', callback: v => '₺' + _compactNum(v) }
                    }
                }
            }
        });
        _buildLegend('lineLegend', datasets);
    }

    // ── Legend ────────────────────────────────────────────────────────────
    function _buildLegend(containerId, datasets) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = datasets.map(ds => `
            <span class="rp-legend-item">
                <span class="rp-legend-dot" style="background:${ds.borderColor}"></span>
                <span class="rp-legend-label">${ds.label}</span>
            </span>
        `).join('');
    }

    // ── Top Products ──────────────────────────────────────────────────────
    function _buildTopProductsList(products) {
        const el = document.getElementById('topProductsList');
        if (!el) return;
        if (!products?.length) { el.innerHTML = '<p class="rp-list-empty">Veri bulunamadı.</p>'; return; }

        el.innerHTML = products.map((p, i) => `
            <div class="rp-list-row">
                <span class="rp-rank-badge rp-rank-${i + 1}">${i + 1}</span>
                <div class="rp-list-info">
                    <span class="rp-list-name">${_esc(p.name)}</span>
                    <span class="rp-list-sub">${_fmt(p.totalQty)} şişe satıldı</span>
                </div>
                <span class="rp-list-value">₺${_compactNum(p.totalRevenue)}K</span>
            </div>
        `).join('');
    }

    // ── Top Customers ─────────────────────────────────────────────────────
    function _buildTopCustomersList(customers) {
        const el = document.getElementById('topCustomersList');
        if (!el) return;
        if (!customers?.length) { el.innerHTML = '<p class="rp-list-empty">Veri bulunamadı.</p>'; return; }

        el.innerHTML = customers.map((c, i) => `
            <div class="rp-list-row">
                <span class="rp-rank-badge rp-rank-${i + 1}">${i + 1}</span>
                <div class="rp-list-info">
                    <span class="rp-list-name">${_esc(c.name)}</span>
                    <span class="rp-list-sub">${c.orderCount} sipariş</span>
                </div>
                <span class="rp-list-value">₺${_compactNum(c.totalRevenue)}K</span>
            </div>
        `).join('');
    }

    // ─── Grafik İndir ─────────────────────────────────────────────────────
    function _bindDownloadButtons() {
        document.getElementById('btnDownloadBarChart')
            ?.addEventListener('click', () => _downloadChart(_barChart, 'kategori-bazli-satislar'));
        document.getElementById('btnDownloadLineChart')
            ?.addEventListener('click', () => _downloadChart(_lineChart, 'gelir-trendi'));
        document.getElementById('btnDownloadTopProducts')
            ?.addEventListener('click', () => _showToast('En çok satan ürünler listesi hazırlanıyor...'));
        document.getElementById('btnDownloadTopCustomers')
            ?.addEventListener('click', () => _showToast('En değerli müşteriler listesi hazırlanıyor...'));
        document.getElementById('btnDownloadReport')
            ?.addEventListener('click', () => {
                let msg = 'Genel rapor indirme başlatıldı...';
                if (_currentStartDate && _currentEndDate) {
                    msg += ` (${_formatDateTr(_currentStartDate)} - ${_formatDateTr(_currentEndDate)})`;
                }
                _showToast(msg);
            });
    }

    function _formatDateTr(isoString) {
        if (!isoString) return '';
        const parts = isoString.split('-');
        if (parts.length !== 3) return isoString;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    function _bindDateFilter() {
        const btn = document.getElementById('btnDateFilter');
        if (!btn || typeof flatpickr === 'undefined') return;

        flatpickr(btn, {
            mode: 'range',
            dateFormat: 'd.m.Y',
            locale: 'tr',
            onReady: function(selectedDates, dateStr, instance) {
                if (instance && instance.calendarContainer) {
                    instance.calendarContainer.classList.add('rp-custom-flatpickr');
                }
            },
            onClose: function(selectedDates, dateStr) {
                if (selectedDates.length === 2) {
                    const btnSpan = btn.querySelector('span');
                    if (btnSpan) btnSpan.textContent = dateStr.replace(' to ', ' - ');
                    
                    // iso format for backend
                    _currentStartDate = new Date(selectedDates[0].getTime() - (selectedDates[0].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    _currentEndDate = new Date(selectedDates[1].getTime() - (selectedDates[1].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    
                    _fetchDashboardData();
                } else if (selectedDates.length === 0) {
                    const btnSpan = btn.querySelector('span');
                    if (btnSpan) btnSpan.textContent = 'Tarih Filtrele';
                    _currentStartDate = null;
                    _currentEndDate = null;
                    _fetchDashboardData();
                }
            }
        });
    }

    function _downloadChart(chartInstance, filename) {
        if (!chartInstance) return;
        const a = document.createElement('a');
        a.href     = chartInstance.toBase64Image();
        a.download = `${filename}.png`;
        a.click();
    }

    // =========================================================
    // BÖLÜM B — HIZLI RAPOR BUTONU → MODAL
    // =========================================================

    /**
     * Her rapor tipi için filtre konfigürasyonu.
     * icon  : Lucide ikon adı
     * build : Modal body HTML'ini döndüren fonksiyon
     */
    // ─── Tarih input HTML yardımcısı ──────────────────────────────────────
    function _dateField(id, label, defaultVal) {
        return `
            <div class="rp-modal-field-group">
                <label class="rp-modal-label" for="${id}">${label}</label>
                <div class="rp-modal-date-wrapper">
                    <i data-lucide="calendar" class="rp-modal-date-icon"></i>
                    <input type="text" id="${id}" class="ws-input-premium ws-datepicker rp-modal-dateinput"
                           placeholder="GG.AA.YYYY" readonly value="${defaultVal}" />
                </div>
            </div>`;
    }

    // ─── Select HTML yardımcısı ────────────────────────────────────────────
    function _selectField(id, label, options, fullWidth) {
        const cls = fullWidth ? 'rp-modal-field-group rp-modal-field-full' : 'rp-modal-field-group';
        return `
            <div class="${cls}">
                <label class="rp-modal-label" for="${id}">${label}</label>
                <select id="${id}" class="ws-input-premium select2-enable">${options}</select>
            </div>`;
    }

    const REPORT_CONFIG = {

        sales: {
            icon: 'file-bar-chart',
            build: () =>
                _dateField('rmf-dateFrom', 'Başlangıç Tarihi', _defaultFromFmt()) +
                _dateField('rmf-dateTo',   'Bitiş Tarihi',     _todayFmt()) +
                _selectField('rmf-category', 'Kategori', `
                    <option value="">Tüm Kategoriler</option>
                    <option value="Kırmızı Şarap">Kırmızı Şarap</option>
                    <option value="Beyaz Şarap">Beyaz Şarap</option>
                    <option value="Rosé">Rosé</option>
                    <option value="Şampanya">Şampanya</option>`) +
                _selectField('rmf-format', 'Dosya Formatı', `
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>`),
        },

        inventory: {
            icon: 'package-search',
            build: () =>
                _selectField('rmf-invCategory', 'Kategori', `
                    <option value="">Tüm Kategoriler</option>
                    <option value="Kırmızı Şarap">Kırmızı Şarap</option>
                    <option value="Beyaz Şarap">Beyaz Şarap</option>
                    <option value="Rosé">Rosé</option>
                    <option value="Şampanya">Şampanya</option>`) +
                _selectField('rmf-invWarehouse', 'Depo', `
                    <option value="">Tüm Depolar</option>
                    <option value="main">Ana Depo</option>
                    <option value="secondary">İkincil Depo</option>`) + `
                <div class="rp-modal-field-group rp-modal-field-full">
                    <label class="rp-modal-label">Stok Durumu</label>
                    <div class="rp-modal-checkbox-group">
                        <label class="rp-modal-checkbox"><input type="checkbox" id="rmf-invLow" checked /><span>Düşük Stok</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" id="rmf-invOk"  checked /><span>Normal Stok</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" id="rmf-invOut"       /><span>Tükenen</span></label>
                    </div>
                </div>` +
                _selectField('rmf-invFormat', 'Dosya Formatı', `
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>`),
        },

        customer: {
            icon: 'users',
            build: () => `
                <div class="rp-modal-field-group rp-modal-field-full">
                    <label class="rp-modal-label" for="rmf-custSearch">Müşteri Ara</label>
                    <div class="rp-modal-text-wrapper">
                        <i data-lucide="search" class="rp-modal-date-icon"></i>
                        <input type="text" id="rmf-custSearch" class="ws-input-premium rp-modal-dateinput"
                               placeholder="Ad, soyad veya e-posta..." />
                    </div>
                </div>` +
                _selectField('rmf-custSegment', 'Segment', `
                    <option value="">Tüm Segmentler</option>
                    <option value="vip">VIP (₺50K+)</option>
                    <option value="regular">Düzenli</option>
                    <option value="new">Yeni (Son 3 Ay)</option>
                    <option value="inactive">Pasif</option>`) +
                _dateField('rmf-custFrom', 'Başlangıç Tarihi', _defaultFromFmt()) +
                _dateField('rmf-custTo',   'Bitiş Tarihi',     _todayFmt()),
        },

        supplier: {
            icon: 'truck',
            build: () =>
                _selectField('rmf-suppName', 'Tedarikçi Seç', `
                    <option value="">Tüm Tedarikçiler</option>
                    <option value="1">Şato Şarapları A.Ş.</option>
                    <option value="2">Boğaziçi İthalat</option>
                    <option value="3">Akdeniz Şarap Evi</option>`, true) +
                _dateField('rmf-suppFrom', 'Başlangıç Tarihi', _defaultFromFmt()) +
                _dateField('rmf-suppTo',   'Bitiş Tarihi',     _todayFmt()) +
                _selectField('rmf-suppFormat', 'Dosya Formatı', `
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>`),
        },

        profitloss: {
            icon: 'trending-up',
            build: () =>
                _selectField('rmf-plYear', 'Yıl', _yearOptions()) +
                _selectField('rmf-plQuarter', 'Dönem', `
                    <option value="">Tüm Yıl</option>
                    <option value="Q1">Q1 (Oca-Mar)</option>
                    <option value="Q2">Q2 (Nis-Haz)</option>
                    <option value="Q3">Q3 (Tem-Eyl)</option>
                    <option value="Q4">Q4 (Eki-Ara)</option>`) + `
                <div class="rp-modal-field-group rp-modal-field-full">
                    <label class="rp-modal-label">Dahil Edilecekler</label>
                    <div class="rp-modal-checkbox-group">
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Satış Geliri</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Maliyet</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Brüt Kâr</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox"       /><span>KDV Detayı</span></label>
                    </div>
                </div>`,
        },

        yearly: {
            icon: 'calendar-range',
            build: () =>
                _selectField('rmf-yrYear', 'Yıl Seç', _yearOptions(), true) + `
                <div class="rp-modal-field-group rp-modal-field-full">
                    <label class="rp-modal-label">Rapor Bölümleri</label>
                    <div class="rp-modal-checkbox-group">
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Kategori Analizi</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Müşteri Özeti</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Ürün Performansı</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox" checked /><span>Gelir & Kâr</span></label>
                        <label class="rp-modal-checkbox"><input type="checkbox"       /><span>Tedarikçi Özeti</span></label>
                    </div>
                </div>` +
                _selectField('rmf-yrFormat', 'Dosya Formatı', `
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>`),
        },
    };

    // =========================================================
    // BÖLÜM C — MODAL YÖNETİMİ
    // =========================================================

    function _bindQuickButtons() {
        document.querySelectorAll('.rp-quick-btn[data-report-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type  = btn.dataset.reportType;
                const label = btn.dataset.reportLabel ?? 'Rapor';
                _openModal(type, label);
            });
        });
    }

    function _bindModal() {
        const backdrop = document.getElementById('rpModalBackdrop');
        const btnClose  = document.getElementById('rpModalClose');
        const btnCancel = document.getElementById('rpModalCancel');
        const btnDl     = document.getElementById('rpModalDownload');

        // Kapat: X butonu
        btnClose?.addEventListener('click', _closeModal);

        // Kapat: Vazgeç butonu
        btnCancel?.addEventListener('click', _closeModal);

        // Kapat: Backdrop'a tıklama
        backdrop?.addEventListener('click', e => {
            if (e.target === backdrop) _closeModal();
        });

        // Klavye — ESC
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') _closeModal();
        });

        // İndir butonu
        btnDl?.addEventListener('click', _handleDownload);
    }

    function _openModal(type, label) {
        const cfg = REPORT_CONFIG[type];
        if (!cfg) { _showToast('Bu rapor tipi henüz desteklenmiyor.'); return; }

        _activeReportType = type;

        // Başlık & ikon güncelle
        const titleEl = document.getElementById('rpModalTitle');
        const iconEl  = document.getElementById('rpModalIconSvg');
        if (titleEl) titleEl.textContent = label;
        if (iconEl)  { iconEl.setAttribute('data-lucide', cfg.icon); }

        // Body'ye filtreleri enjekte et
        const body = document.getElementById('rpModalBody');
        if (body) body.innerHTML = cfg.build();

        // Lucide ikonları yenile
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // ── Flatpickr: ws-datepicker alanlarını başlat ────────────────────
        if (typeof flatpickr !== 'undefined') {
            body.querySelectorAll('.ws-datepicker').forEach(el => {
                // Önceki instance varsa temizle
                if (el._flatpickr) el._flatpickr.destroy();
                flatpickr(el, {
                    dateFormat: 'd.m.Y',
                    locale: 'tr',
                    disableMobile: true,
                    allowInput: false,
                });
            });
        }

        // ── Select2: ws-input-premium select alanlarını başlat ───────────
        if (typeof $ !== 'undefined' && $.fn.select2) {
            const $backdrop = $('#rpModalBackdrop');
            body.querySelectorAll('select.select2-enable').forEach(el => {
                $(el).select2({
                    theme: 'default',
                    width: '100%',
                    dropdownParent: $backdrop,
                });
            });
        }

        // Backdrop göster
        const backdrop = document.getElementById('rpModalBackdrop');
        if (backdrop) {
            backdrop.classList.add('rp-modal-open');
            backdrop.removeAttribute('aria-hidden');
            document.body.classList.add('rp-no-scroll');
        }
    }

    function _closeModal() {
        const backdrop = document.getElementById('rpModalBackdrop');
        if (!backdrop) return;

        backdrop.classList.remove('rp-modal-open');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('rp-no-scroll');
        _activeReportType = null;

        // Body'yi animasyon bittikten sonra temizle
        setTimeout(() => {
            const body = document.getElementById('rpModalBody');
            if (body) body.innerHTML = '';
        }, 300);
    }

    /**
     * İndir butonuna basıldığında çağrılır.
     * TODO: Gerçek backend endpoint'i hazır olduğunda aşağıdaki
     * yorum bloğunu kaldırarak fetch çağrısını aktif edin.
     *
     * Örnek payload yapısı:
     * POST /Reports/Download
     * { type, dateFrom, dateTo, category, format, ... }
     */
    function _handleDownload() {
        const type = _activeReportType;
        if (!type) return;

        // ── Filtre değerlerini topla ─────────────────────────────────────
        const payload = { reportType: type };

        document.querySelectorAll('#rpModalBody [id]').forEach(el => {
            const key = el.id.replace('rmf-', '');
            if (el.type === 'checkbox') {
                payload[key] = el.checked;
            } else {
                payload[key] = el.value;
            }
        });

        console.info('[ReportDashboard] İndirilecek rapor:', payload);

        /*
         * ── BACKEND ENTEGRASYONU (placeholder) ──────────────────────────
         * Aşağıdaki bloğu backend endpoint'i hazır olduğunda aktif edin:
         *
         * fetch('/Reports/Download', {
         *     method: 'POST',
         *     headers: { 'Content-Type': 'application/json' },
         *     body: JSON.stringify(payload)
         * })
         * .then(res => res.blob())
         * .then(blob => {
         *     const url  = URL.createObjectURL(blob);
         *     const a    = document.createElement('a');
         *     a.href     = url;
         *     a.download = `${payload.reportType}-raporu.xlsx`;
         *     a.click();
         *     URL.revokeObjectURL(url);
         * })
         * .catch(err => console.error('İndirme hatası:', err));
         * ─────────────────────────────────────────────────────────────── */

        // Şimdilik animasyon + toast
        const btn = document.getElementById('rpModalDownload');
        if (btn) {
            const orig = btn.innerHTML;
            btn.disabled  = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="rp-spin"></i><span>Hazırlanıyor...</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                btn.disabled  = false;
                btn.innerHTML = orig;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                _showToast('Rapor hazır, indiriliyor...');
                _closeModal();
            }, 1800);
        }
    }

    // =========================================================
    // BÖLÜM D — YARDIMCI FONKSİYONLAR
    // =========================================================

    function _fmt(n)        { return Number(n).toLocaleString('tr-TR'); }
    function _compactNum(n) {
        const v = Number(n);
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
        if (v >= 1_000)     return (v / 1_000).toFixed(0);
        return v.toFixed(0);
    }
    function _esc(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function _today() {
        return new Date().toISOString().split('T')[0];
    }
    function _defaultFrom() {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        return d.toISOString().split('T')[0];
    }
    // Flatpickr formatı için: dd.mm.yyyy
    function _todayFmt() {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}.${mm}.${d.getFullYear()}`;
    }
    function _defaultFromFmt() {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}.${mm}.${d.getFullYear()}`;
    }
    function _yearOptions() {
        const y = new Date().getFullYear();
        return [y, y - 1, y - 2]
            .map(yr => `<option value="${yr}"${yr === y ? ' selected' : ''}>${yr}</option>`)
            .join('');
    }
    function _showToast(msg) {
        if (typeof UIHelper !== 'undefined' && UIHelper.showToast) {
            UIHelper.showToast(msg, 'check');
        }
    }
    function _showLoadError() {
        ['topProductsList', 'topCustomersList'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p class="rp-list-empty rp-list-error">Veri yüklenemedi.</p>';
        });
    }

    // ─── Public API ───────────────────────────────────────────────────────
    return { init };

})();

window.ReportDashboard = ReportDashboard;

document.addEventListener('DOMContentLoaded', () => {
    ReportDashboard.init();
});

// Geriye dönük uyumluluk
window.ReportManager = {
    setReportType: () => {},
    updateWarehouse: () => {}
};