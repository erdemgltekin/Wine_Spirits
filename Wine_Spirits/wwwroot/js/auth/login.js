document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function () {
            const btn = this.querySelector(".btn-login");
            btn.disabled = true;
            btn.innerHTML = 'Giriş Yapılıyor...';
        });
    }
});