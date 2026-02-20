/**
 * Backoffice Talep Yönetimi Sayfası için JavaScript
 */
function processRequest(id, action) {
    if (!confirm('Bu işlemi onaylıyor musunuz?')) return;

    $.ajax({
        url: `/Management/${action}Request`,
        type: 'POST',
        data: { id: id },
        success: function (response) {
            if (response.success) {
                // Satırı animasyonla kaldır
                const row = document.getElementById(`row-${id}`);
                if (row) {
                    row.style.transition = 'opacity 0.3s ease';
                    row.style.opacity = '0';
                    setTimeout(() => row.remove(), 300);
                }

                // site.js içindeki toast fonksiyonunu çağır
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

// DOM yüklendiğinde ikonları tazele (Global site.js yapmazsa diye)
document.addEventListener('DOMContentLoaded', function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
