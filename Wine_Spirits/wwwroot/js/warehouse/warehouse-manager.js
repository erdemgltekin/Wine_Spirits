/**
 * @file warehouse-manager.js
 * @description Depo Yönetimi sayfası etkileşimleri.
 * Modal yönetimi, arama ve silme.
 */

const WarehouseManager = (function () {

    // Global Modal Instance
    let globalModal = null;

    function init() {
        console.log("WarehouseManager: Started");

        // Modal instance'ını al (eğer varsa)
        const modalEl = document.getElementById('globalModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            globalModal = new bootstrap.Modal(modalEl);
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();

        bindSearch();
        bindDeleteActions();
        bindAddButton();
    }

    /**
     * Yeni Depo Ekle Butonu
     * AJAX ile Create partial'ı çeker ve Modal içinde gösterir.
     */
    function bindAddButton() {
        // ID veya Class ile butonu bul
        const addBtns = document.querySelectorAll('.btn-warehouse-add, a[asp-action="Create"]'); // Hem CSS class hem ASP tag helper sonucu
        // Ancak ASP tag helper 'href="/Warehouses/Create"' üretir. Bunu JS ile yakalayacağız.

        // En sağlamı: .btn-warehouse-add sınıfına sahip olanlar (eğer link ise preventDefault)
        document.body.addEventListener('click', function (e) {
            const target = e.target.closest('.btn-warehouse-add');
            if (target) {
                e.preventDefault();
                const url = target.getAttribute('href') || '/Warehouses/Create';
                openCreateModal(url);
            }
        });
    }

    function openCreateModal(url) {
        const modalContent = document.getElementById('globalModalContent');
        if (!modalContent || !globalModal) return;

        // Yükleniyor göster
        modalContent.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary"></div></div>';
        globalModal.show();

        // fetch ile içeriği al (AJAX)
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.text())
            .then(html => {
                modalContent.innerHTML = html;
                // İçerik yüklendikten sonra ikonları yeniden oluştur
                if (typeof lucide !== 'undefined') lucide.createIcons();

                // Form submit'i AJAX yap (Opsiyonel, tam SPA hissi için)
                bindFormSubmit(modalContent.querySelector('form'));
            })
            .catch(err => {
                console.error(err);
                modalContent.innerHTML = '<div class="p-3 text-danger">Yükleme hatası.</div>';
            });
    }

    // Modal içindeki form submit işlemini yakala
    function bindFormSubmit(form) {
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            const action = form.getAttribute('action');

            fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(res => {
                    if (res.ok) {
                        // Başarılı ise modalı kapat ve sayfayı yenile
                        // Veya sadece grid'i güncelle (daha advanced)
                        globalModal.hide();
                        window.location.reload();
                    } else {
                        // Hata varsa (Validation vb) formu güncelle
                        return res.text().then(html => {
                            document.getElementById('globalModalContent').innerHTML = html;
                            if (typeof lucide !== 'undefined') lucide.createIcons();
                            bindFormSubmit(document.getElementById('globalModalContent').querySelector('form'));
                        });
                    }
                });
        });
    }

    function bindSearch() {
        const searchInput = document.getElementById('warehouseSearch');
        if (!searchInput) return;

        searchInput.addEventListener('keyup', function (e) {
            const term = e.target.value.toLowerCase().trim();
            const wrappers = document.querySelectorAll('.ws-warehouse-card-wrapper'); // Wrapper üzerinden

            wrappers.forEach(wrapper => {
                const card = wrapper.querySelector('.ws-warehouse-card');
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const location = (card.getAttribute('data-location') || '').toLowerCase();

                if (name.includes(term) || location.includes(term)) {
                    wrapper.style.display = '';
                } else {
                    wrapper.style.display = 'none';
                }
            });
        });
    }

    function bindDeleteActions() {
        // Dinamik içerik olabileceği için document level delegation
        document.body.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-delete-warehouse');
            if (btn) {
                e.preventDefault();
                const form = btn.closest('form');
                if (confirm('Bu depoyu silmek üzeresiniz. Onaylıyor musunuz?')) {
                    form.submit();
                }
            }
        });
    }

    return { init: init };
})();

document.addEventListener('DOMContentLoaded', WarehouseManager.init);