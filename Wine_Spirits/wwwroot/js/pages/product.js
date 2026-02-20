/**
 * @file product.js
 * @description Ürünler sayfası yönetim scripti.
 */

const ProductPage = {
    init: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        this.bindEvents();
    },

    bindEvents: function () {
        const btnCreate = document.getElementById('btnCreateNew');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                // Navigate to Create page or open modal
                window.location.href = '/Products/Create';
            });
        }

        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                // Basic table search
                const rows = document.querySelectorAll('#productsTableBody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ProductPage.init());
