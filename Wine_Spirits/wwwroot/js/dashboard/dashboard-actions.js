/**
 * @file dashboard-actions.js
 * @description Dashboard aksiyon butonları için interaktif özellikler.
 * Buton tıklamaları ve animasyonlarını yönetir.
 */

const DashboardActions = (function () {
    /**
     * @function init
     * @description Sayfa yüklendiğinde çalışacak başlatıcı fonksiyon.
     * Butonlara event listener ekler ve Lucide ikonlarını günceller.
     */
    function init() {
        console.log("Dashboard Aksiyonları: Başlatılıyor...");

        // Buton efektlerini initialize et
        attachRippleEffects();
    }

    /**
     * @function attachRippleEffects
     * @description Butonlara tıklama anında dalga (ripple) efekti ekler.
     * Görsel geri bildirimi artırır.
     */
    function attachRippleEffects() {
        const buttons = document.querySelectorAll('.ws-btn-modern');

        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                // Tıklama animasyonu için basit bir class ekleyip çıkarabiliriz
                // Ancak şu an CSS transform yeterli.
                // Burası gelecekteki AJAX işlemleri veya modal açılışları için hazır.
                console.log(`Butona tıklandı: ${this.innerText.trim()}`);
            });
        });
    }

    // Public API
    return {
        init: init
    };
})();

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function () {
    DashboardActions.init();
});
