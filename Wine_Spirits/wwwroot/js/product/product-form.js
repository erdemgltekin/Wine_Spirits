/**
 * Ürün Düzenleme ve Oluşturma Formları için JavaScript
 */
$(document).ready(function () {
    // Select2 başlatma
    if ($.fn.select2) {
        $('.select2-enable').select2({
            placeholder: "Seçiniz...",
            allowClear: true,
            width: '100%',
            dropdownParent: $('#sidePanel').length ? $('#sidePanel') : null
        });
    }

    // Lucide ikonlarını canlandır (eğer Layout veya site.js kaçırırsa)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * Destek/Talep isteği gönderimi (Kategori, Ülke, Birim vb.)
 * @param {string} type - Talep tipi
 * @param {string} label - Görünen isim
 */
function sendSupportRequest(type, label) {
    const name = prompt(`Yeni ${label} talebi için isim giriniz:`);
    if (name && name.trim() !== "") {
        $.ajax({
            url: '/Support/SendRequest',
            type: 'POST',
            data: { type: type, name: name },
            success: function (response) {
                if (response.success) {
                    // showStatusToast site.js içinde tanımlıdır
                    if (typeof showStatusToast === 'function') {
                        showStatusToast(response.message, 'check-circle', true);
                    } else {
                        alert(response.message);
                    }
                } else {
                    alert(response.message);
                }
            },
            error: function () {
                alert("İşlem sırasında bir hata oluştu.");
            }
        });
    }
}
