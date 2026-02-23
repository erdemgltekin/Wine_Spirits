/**
 * @file warehouse-manager.js
 * @description Modüler Depo Yönetimi Scripti.
 * Modal yönetimi, arama, filtreleme ve silme işlemlerini içerir.
 */

const WarehouseManager = (function () {
    let globalModalInstance = null;

    // Başlatıcı: Sayfa yüklendiğinde temel elementleri bağlar
    function init() {
        const modalEl = document.getElementById('globalModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            globalModalInstance = new bootstrap.Modal(modalEl);
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();

        bindSearch();
        console.log("WarehouseManager: Sistem başarıyla başlatıldı.");
    }

    // Modal İçeriği Yükle (Create / Edit için ortak AJAX yapısı)
    function loadModal(url) {
        const contentArea = document.getElementById('globalModalContent');
        if (!contentArea || !globalModalInstance) return;

        // Yükleniyor animasyonu
        contentArea.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Yükleniyor...</p></div>';
        globalModalInstance.show();

        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => res.text())
            .then(html => {
                contentArea.innerHTML = html;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                bindFormSubmit(contentArea.querySelector('form'));
            })
            .catch(err => {
                console.error("Modal yükleme hatası:", err);
                contentArea.innerHTML = '<div class="p-4 text-center text-danger"><i data-lucide="alert-triangle"></i><p>İçerik yüklenemedi.</p></div>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
    }

    // Formu AJAX ile Gönder (Sayfa yenilenmeden doğrulama yapar)
    function bindFormSubmit(form) {
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(res => {
                    if (res.ok) {
                        globalModalInstance.hide();
                        window.location.reload();
                    } else {
                        // Hata durumunda (Validation hatası gibi) formu tekrar yükle
                        return res.text().then(html => {
                            document.getElementById('globalModalContent').innerHTML = html;
                            bindFormSubmit(document.getElementById('globalModalContent').querySelector('form'));
                        });
                    }
                });
        });
    }

    // Canlı Arama Fonksiyonu (Input bazlı)
    function bindSearch() {
        const input = document.getElementById('warehouseSearch');
        if (!input) return;

        input.addEventListener('keyup', function () {
            const term = this.value.toLowerCase().trim();
            applyFilters(term, null); // Mevcut arama terimiyle filtrele
        });
    }

    // Genel Filtreleme Mantığı (Arama + Bölge Seçimi)
    function applyFilters(searchTerm = '', regionValue = 'all') {
        const items = document.querySelectorAll('.ws-warehouse-card-wrapper');
        const currentSearch = searchTerm || document.getElementById('warehouseSearch').value.toLowerCase().trim();

        items.forEach(item => {
            const card = item.querySelector('.ws-warehouse-card');
            const name = card.getAttribute('data-name').toLowerCase();
            const loc = card.getAttribute('data-location').toLowerCase();
            const regionAttr = item.getAttribute('data-location-filter');

            const matchesSearch = name.includes(currentSearch) || loc.includes(currentSearch);
            const matchesRegion = (regionValue === 'all' || regionValue === null || regionAttr === regionValue);

            if (matchesSearch && matchesRegion) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Dışarıya Açılan Fonksiyonlar (HTML içinden erişilebilir)
    return {
        init: init,

        // Modal Tetikleyicileri
        openCreateModal: function () {
            loadModal('/Warehouses/Create');
        },
        openEditModal: function (id) {
            loadModal('/Warehouses/Edit/' + id);
        },

        // Silme İşlemi
        deleteWarehouse: function (id) {
            if (confirm('Bu depoyu silmek istediğinize emin misiniz?')) {
                fetch('/Warehouses/Delete/' + id, {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                    .then(res => {
                        if (res.ok) window.location.reload();
                        else alert('Silme işlemi sırasında bir hata oluştu.');
                    });
            }
        },

        // Filtreleme Fonksiyonu (HTML'deki onclick olayları burayı çağırır)
        filterByValue: function (value) {
            const filterText = document.getElementById('selectedRegionText');
            if (filterText) {
                filterText.innerText = value === 'all' ? 'Bölge Seçin' : value;
            }
            applyFilters(null, value);
        }
    };
})();

// Sayfa hazır olduğunda init fonksiyonunu çalıştır
document.addEventListener('DOMContentLoaded', WarehouseManager.init);