const WarehouseManager = (function () {

    function init() {
        bindSearch();
        bindFilterVisuals(); // Modern görsel efektler için eklendi
        console.log("WarehouseManager: Business logic initialized.");
    }

    // Filtre kutularına tıklandığında veya değer seçildiğinde mor border efekti
    function bindFilterVisuals() {
        const filterItems = document.querySelectorAll('.ws-filter-item');

        filterItems.forEach(item => {
            // Eğer içinde input varsa (Arama kutusu gibi)
            const input = item.querySelector('input');
            if (input) {
                input.addEventListener('focus', () => item.classList.add('is-active'));
                input.addEventListener('blur', () => {
                    if (input.value === "") item.classList.remove('is-active');
                });
            }
        });
    }

    function bindSearch() {
        const input = document.getElementById('warehouseSearch');
        if (!input) return;

        input.addEventListener('keyup', function () {
            const term = this.value.toLowerCase().trim();
            const parent = this.closest('.ws-filter-item');

            // Arama yapılıyorsa kutuyu "is-active" yap (Ürünler sayfasındaki gibi)
            if (term.length > 0) parent.classList.add('is-active');
            else parent.classList.remove('is-active');

            applyFilters(term, null);
        });
    }

    function applyFilters(searchTerm = '', regionValue = 'all') {
        // Senin orijinal .ws-warehouse-card yapın üzerinden gidiyoruz
        const items = document.querySelectorAll('.ws-warehouse-card');
        const currentSearch = searchTerm !== null ? searchTerm : document.getElementById('warehouseSearch').value.toLowerCase().trim();
        const activeRegion = regionValue !== null ? regionValue : (document.getElementById('selectedRegionText').innerText === 'Tüm Bölgeler' ? 'all' : document.getElementById('selectedRegionText').innerText);

        items.forEach(card => {
            const name = card.getAttribute('data-name').toLowerCase();
            const loc = card.getAttribute('data-location').toLowerCase();
            const regionAttr = card.getAttribute('data-location'); // card.scss ile uyumlu attribute

            const matchesSearch = name.includes(currentSearch) || loc.includes(currentSearch);
            const matchesRegion = (activeRegion === 'all' || regionAttr === activeRegion);

            // Görsel geçiş (Display ve Opacity bir arada)
            if (matchesSearch && matchesRegion) {
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }

    return {
        init: init,

        deleteWarehouse: function (id) {
            Swal.fire({
                title: 'Emin misiniz?',
                text: "Bu depo silindiğinde bağlı tüm veriler etkilenebilir!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed', // Senin mor rengin
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'Vazgeç',
                borderRadius: '15px'
            }).then((result) => {
                if (result.isConfirmed) {
                    // GlobalUI standartına uygun AJAX çağrısı
                    $.post('/Warehouses/Delete/' + id)
                        .done(function (res) {
                            if (res.success) {
                                Swal.fire('Silindi!', 'Depo başarıyla kaldırıldı.', 'success')
                                    .then(() => window.location.reload());
                            } else {
                                Swal.fire('Hata!', res.message || 'Silme işlemi başarısız.', 'error');
                            }
                        })
                        .fail(function () {
                            Swal.fire('Hata!', 'Sunucuyla bağlantı kurulamadı.', 'error');
                        });
                }
            });
        },

        filterByValue: function (value) {
            const filterText = document.getElementById('selectedRegionText');
            const trigger = filterText?.closest('.ws-filter-item');

            if (filterText) {
                filterText.innerText = value === 'all' ? 'Tüm Bölgeler' : value;
            }

            // Değer seçildiyse "is-active" sınıfını yönet (Mor çerçeve kontrolü)
            if (value !== 'all') {
                trigger?.classList.add('is-active');
            } else {
                trigger?.classList.remove('is-active');
            }

            applyFilters(null, value);
        }
    };
})();

document.addEventListener('DOMContentLoaded', WarehouseManager.init);