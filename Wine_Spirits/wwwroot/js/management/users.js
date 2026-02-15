$(document).ready(function () {
    lucide.createIcons();

    // Silme İşlemi (Ajax)
    $('.btn-delete-user').on('click', function () {
        const userId = $(this).data('id');
        const userName = $(this).data('name');

        if (confirm(`${userName} isimli personeli arşivlemek istediğinize emin misiniz?`)) {
            $.post('/Management/DeleteUser', { id: userId }, function (response) {
                if (response.success) {
                    // Satırı bul ve zarifçe kaldır
                    $(`tr[data-user-id="${userId}"]`).fadeOut(400, function () {
                        $(this).remove();
                    });
                    // Burada bir toast message veya alert gösterilebilir
                    alert(response.message);
                } else {
                    alert(response.error);
                }
            });
        }
    });
});