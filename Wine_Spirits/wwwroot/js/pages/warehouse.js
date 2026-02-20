/**
 * @file warehouse.js
 * @description Depo Yönetimi sayfası etkileşimleri.
 */

const WarehouseManager = {
    init: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        this.bindSearch();
        this.bindDeleteActions();
    },

    bindSearch: function () {
        const searchInput = document.getElementById('warehouseSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.ws-warehouse-card-wrapper').forEach(wrapper => {
                const card = wrapper.querySelector('.ws-warehouse-card');
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const location = (card.getAttribute('data-location') || '').toLowerCase();
                wrapper.style.display = (name.includes(term) || location.includes(term)) ? '' : 'none';
            });
        });
    },

    bindDeleteActions: function () {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-delete-warehouse');
            if (btn) {
                e.preventDefault();
                if (confirm('Bu depoyu silmek istediğinize emin misiniz?')) {
                    btn.closest('form').submit();
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => WarehouseManager.init());
