const WarehouseManager = (function () {

    function init() {
        bindSearch();
        console.log("WarehouseManager: Business logic initialized.");
    }

    function bindSearch() {
        const input = document.getElementById('warehouseSearch');
        if (!input) return;

        input.addEventListener('keyup', function () {
            const term = this.value.toLowerCase().trim();
            applyFilters(term, null);
        });
    }

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

            item.style.display = (matchesSearch && matchesRegion) ? '' : 'none';
        });
    }

    return {
        init: init,

        deleteWarehouse: function (id) {
            Swal.fire({
                title: 'Emin misiniz?',
                text: "Bu depo silindiğinde geri alınamaz!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'Vazgeç'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.post('/Warehouses/Delete/' + id, function (res) {
                        window.location.reload();
                    });
                }
            });
        },

        filterByValue: function (value) {
            const filterText = document.getElementById('selectedRegionText');
            if (filterText) {
                filterText.innerText = value === 'all' ? 'Tüm Bölgeler' : value;
            }
            applyFilters(null, value);
        }
    };
})();

document.addEventListener('DOMContentLoaded', WarehouseManager.init);