const InventoryFilters = (function () {
    let currentFilter = {
        sort: 'name_asc',
        criticalStock: false
    };

    function init() {
        bindSortEvents();
        initExternalLibraries();
    }

    function initExternalLibraries() {
        // İkonları başlat
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Tarih seçiciyi başlat
        if (document.getElementById('dateFilter')) {
            flatpickr("#dateFilter", {
                locale: "tr",
                mode: "range",
                dateFormat: "d.m.Y"
            });
        }
    }

    function bindSortEvents() {
        const sortItems = document.querySelectorAll('.ws-sort-dropdown .dropdown-item');
        const sortLabel = document.getElementById('currentSortLabel');

        sortItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedValue = this.getAttribute('data-sort');

                if (selectedValue === 'critical_stock') {
                    toggleCriticalStock(this);
                } else {
                    applySort(this, selectedValue, sortLabel);
                }
            });
        });
    }

    function applySort(element, sortValue, labelElement) {
        document.querySelectorAll('.ws-sort-dropdown .dropdown-item').forEach(i => {
            if (i.getAttribute('data-sort') !== 'critical_stock') i.classList.remove('active');
        });
        element.classList.add('active');
        if (labelElement) labelElement.innerText = element.innerText;
        currentFilter.sort = sortValue;

        // ProductsManager.reloadTable(currentFilter); // Varsa tetikle
        console.log("Sıralama:", sortValue);
    }

    function toggleCriticalStock(element) {
        currentFilter.criticalStock = !currentFilter.criticalStock;
        element.classList.toggle('active', currentFilter.criticalStock);
        filterTableRowsDOM();
    }

    function filterTableRowsDOM() {
        const rows = document.querySelectorAll('#productsTableBody tr');
        rows.forEach(row => {
            const stockCell = row.cells[5]; // Stok sütunu
            if (stockCell) {
                const stockVal = parseInt(stockCell.innerText.replace(/[^0-9]/g, '')) || 0;
                row.style.display = (currentFilter.criticalStock && stockVal >= 10) ? 'none' : '';
            }
        });
    }

    return { init: init };
})();

document.addEventListener('DOMContentLoaded', () => InventoryFilters.init());