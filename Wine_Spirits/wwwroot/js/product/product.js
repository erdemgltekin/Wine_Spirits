/**
 * Product Manager
 * Global UI standartlarına uygun şekilde ürün listesini ve etkileşimleri yönetir.
 */
const ProductManager = {
    init: function () {
        console.log("ProductManager başlatıldı.");
        this.initializeIcons();
        this.attachEvents();
    },

    initializeIcons: function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    attachEvents: function () {
        // --- Yeni Ürün Modalı Açma ---
        const btnNew = document.getElementById('btnCreateNew');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                console.log("Yeni ürün ekleme modalı açılacak...");
            });
        }

        // --- Sıralama ve Filtreleme ---
        const sortItems = document.querySelectorAll('[data-sort]');
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sortItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                console.log("Sıralama kriteri seçildi:", item.getAttribute('data-sort'));
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProductManager.init();
});
