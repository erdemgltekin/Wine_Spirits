/**
 * DashboardActivity Object: Zaman tüneli ve aktivite akışı lojistiği
 * Bu dosya, son hareketlerin zaman damgalarını (X dakika önce vb.) dinamik olarak yönetir.
 */
const DashboardActivity = {
    /**
     * Aktivite panelini başlatır ve zaman damgalarını günceller
     */
    init: function () {
        console.log("DashboardActivity Başlatıldı");
        this.updateTimeStamps();

        // Her dakika zaman damgalarını tazele
        setInterval(() => this.updateTimeStamps(), 60000);
    },

    /**
     * .timeline-time sınıfına sahip elemanlardaki ISO tarihlerini göreceli zamana çevirir
     */
    updateTimeStamps: function () {
        document.querySelectorAll('.timeline-time').forEach(el => {
            const dateStr = el.getAttribute('data-date');
            if (dateStr) {
                el.textContent = this.timeAgo(new Date(dateStr));
            }
        });
    },

    /**
     * Tarih farkını hesaplayıp Türkçe metne çeviren yardımcı metod
     */
    timeAgo: function (date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;

        if (interval > 1) return Math.floor(interval) + " yıl önce";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " ay önce";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " gün önce";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " saat önce";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " dk önce";

        return "Az önce";
    }
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    DashboardActivity.init();
});
