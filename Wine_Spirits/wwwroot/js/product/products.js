// Ürün yönetimi ile ilgili tüm JS mantığı
const ProductManager = {
    init: function () {
        // [Cleanup]: Modal kaldırıldığı için buradaki JS mantığına şimdilik ihtiyaç kalmadı.
        // İleride ürün listesiyle ilgili (örn: filtreleme, sıralama) JS kodları buraya eklenebilir.
        console.log("ProductManager initialized.");
    }
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    ProductManager.init();
});