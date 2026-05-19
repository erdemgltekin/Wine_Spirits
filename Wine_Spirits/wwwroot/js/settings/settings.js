/**
 * ============================================================
 *  WS SETTINGS PAGE — settings.js
 *  Sorumluluk:
 *    1. Sekme navigasyonu (Tab switching)
 *    2. Profil güncelleme AJAX
 *    3. Şifre değiştirme AJAX
 *    4. Personel rol güncelleme AJAX (Admin+)
 *    5. Personel aktif/pasif toggle AJAX (Admin+)
 *    6. Göz butonu: şifre göster/gizle
 *    7. Select2 init (personel kart rol selectbox'ları)
 * ============================================================
 */

const SettingsPage = (() => {

    // ─── CSRF token ────────────────────────────────────────────────────
    function _csrfToken() {
        return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
    }

    // ─── Toast yardımcısı ──────────────────────────────────────────────
    function _toast(msg, icon = 'check') {
        if (typeof UIHelper !== 'undefined' && UIHelper.showToast) {
            UIHelper.showToast(msg, icon);
        } else if (typeof SidePanel !== 'undefined' && SidePanel.showToast) {
            SidePanel.showToast(msg, icon === 'check' ? 'check-circle' : 'alert-circle');
        } else {
            alert(msg);
        }
    }

    // ─── Lucide icon yenile ────────────────────────────────────────────
    function _refreshIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // =========================================================
    // 1. SEKME NAVİGASYONU
    // =========================================================
    function _initTabs() {
        console.log("Settings JS tıkır tıkır çalışıyor!");

        const tabButtons = document.querySelectorAll(".ws-tab-btn");
        const tabContents = document.querySelectorAll(".ws-tab-content");

        tabButtons.forEach(button => {
            button.addEventListener("click", function () {
                const targetTab = this.getAttribute("data-tab");

                // 1. Tüm butonlardan active sınıfını kaldır ve tıklanana ekle
                tabButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");

                // 2. Tüm içeriklerden active sınıfını kaldır
                tabContents.forEach(content => content.classList.remove("active"));

                // 3. Hedeflenen id'ye sahip içeriği bul ve active sınıfı ekle
                const targetContent = document.getElementById(targetTab) || document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add("active");
                }
                
                // Select2'yi yenile (personel sekmesinde render sorunu önleme)
                if (targetTab === 'sistem') _initUserRoleSelects();
            });
        });
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // =========================================================
    // 2. PROFİL GÜNCELLEME
    // =========================================================
    function _initProfileForm() {
        const form = document.getElementById('formProfile');
        if (!form) return;

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('btnSaveProfile');
            const origHTML = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="rp-spin"></i><span>Kaydediliyor...</span>';
            _refreshIcons();

            try {
                const body = new URLSearchParams({
                    __RequestVerificationToken: _csrfToken(),
                    fullName: document.getElementById('fullName')?.value ?? '',
                    position: document.getElementById('position')?.value ?? '',
                });

                const res  = await fetch('/Settings/UpdateProfile', { method: 'POST', body });
                const data = await res.json();

                _toast(data.message, data.success ? 'check' : 'alert-circle');
            } catch (err) {
                _toast('Bir hata oluştu, tekrar deneyin.', 'alert-circle');
                console.error('[Settings] UpdateProfile error:', err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = origHTML;
                _refreshIcons();
            }
        });
    }

    // =========================================================
    // 3. ŞİFRE DEĞİŞTİRME
    // =========================================================
    function _initPasswordForm() {
        const form = document.getElementById('formPassword');
        if (!form) return;

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('btnChangePassword');
            const origHTML = btn.innerHTML;

            const newPwd     = document.getElementById('newPassword')?.value ?? '';
            const confirmPwd = document.getElementById('confirmPassword')?.value ?? '';

            if (newPwd !== confirmPwd) {
                _toast('Yeni şifreler eşleşmiyor.', 'alert-circle');
                return;
            }
            if (newPwd.length < 4) {
                _toast('Şifre en az 4 karakter olmalıdır.', 'alert-circle');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="rp-spin"></i><span>Güncelleniyor...</span>';
            _refreshIcons();

            try {
                const body = new URLSearchParams({
                    __RequestVerificationToken: _csrfToken(),
                    currentPassword: document.getElementById('currentPassword')?.value ?? '',
                    newPassword:     newPwd,
                    confirmPassword: confirmPwd,
                });

                const res  = await fetch('/Settings/ChangePassword', { method: 'POST', body });
                const data = await res.json();

                if (data.success) form.reset();
                _toast(data.message, data.success ? 'check' : 'alert-circle');
            } catch (err) {
                _toast('Bir hata oluştu, tekrar deneyin.', 'alert-circle');
                console.error('[Settings] ChangePassword error:', err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = origHTML;
                _refreshIcons();
            }
        });
    }

    // =========================================================
    // 4. PERSONEL ROL GÜNCELLEME
    // =========================================================
    function _initUserRoleSelects() {
        if (typeof $ !== 'undefined' && $.fn.select2) {
            document.querySelectorAll('.stg-role-select').forEach(el => {
                if ($(el).hasClass('select2-hidden-accessible')) return;
                $(el).select2({
                    theme: 'default',
                    width: '100%',
                    minimumResultsForSearch: Infinity,
                });
            });
        }

        document.querySelectorAll('.stg-role-select').forEach(select => {
            // Select2 change handler
            if (typeof $ !== 'undefined') {
                $(select).off('change.stg').on('change.stg', async function() {
                    await _updateRole(this);
                });
            } else {
                // Vanilla JS fallback
                select.addEventListener('change', async function() {
                    await _updateRole(this);
                });
            }
        });
    }

    async function _updateRole(selectEl) {
        const userId = selectEl.dataset.userId;
        const role   = selectEl.value;
        if (!userId) return;

        try {
            const body = new URLSearchParams({
                __RequestVerificationToken: _csrfToken(),
                userId,
                role,
            });

            const res  = await fetch('/Settings/UpdateUserRole', { method: 'POST', body });
            const data = await res.json();
            _toast(data.message, data.success ? 'check' : 'alert-circle');
        } catch (err) {
            _toast('Rol güncellenirken hata oluştu.', 'alert-circle');
            console.error('[Settings] UpdateUserRole error:', err);
        }
    }

    // =========================================================
    // 5. PERSONEL AKTİF/PASİF TOGGLE
    // =========================================================
    function _initToggleActiveButtons() {
        document.addEventListener('click', async e => {
            const btn = e.target.closest('.stg-toggle-btn');
            if (!btn) return;

            const userId = btn.dataset.userId;
            if (!userId) return;

            btn.disabled = true;

            try {
                const body = new URLSearchParams({
                    __RequestVerificationToken: _csrfToken(),
                    userId,
                });

                const res  = await fetch('/Settings/ToggleUserActive', { method: 'POST', body });
                const data = await res.json();

                if (data.success) {
                    _toast(data.message, 'check');
                    
                    const card = document.getElementById(`userCard-${userId}`);
                    if (card) card.classList.toggle('stg-user-card--inactive');

                    const icon = btn.querySelector('svg, i');
                    const isInactive = card?.classList.contains('stg-user-card--inactive');
                    
                    if (icon) icon.setAttribute('data-lucide', isInactive ? 'toggle-left' : 'toggle-right');
                    btn.title = isInactive ? 'Aktif Yap' : 'Pasif Yap';
                    
                    // Pill güncelle
                    const pill = card?.querySelector('.stg-status-pill');
                    if (pill) {
                        pill.className = `stg-status-pill ${isInactive ? 'stg-status--passive' : 'stg-status--active'}`;
                        pill.innerHTML = `<i data-lucide="${isInactive ? 'circle-x' : 'circle-check'}"></i> ${isInactive ? 'Pasif' : 'Aktif'}`;
                    }

                    _refreshIcons();
                } else {
                    _toast(data.message, 'alert-circle');
                }
            } catch (err) {
                _toast('İşlem sırasında hata oluştu.', 'alert-circle');
                console.error('[Settings] ToggleUserActive error:', err);
            } finally {
                btn.disabled = false;
            }
        });
    }

    // =========================================================
    // 6. ŞİFRE GÖZ BUTONU
    // =========================================================
    function _initEyeButtons() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.stg-eye-btn');
            if (!btn) return;

            const targetId = btn.dataset.target;
            const input    = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const icon = btn.querySelector('svg, i');
            if (icon) {
                icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                _refreshIcons();
            }
        });
    }

    // =========================================================
    // 7. BİLDİRİMLER VE GÖRÜNÜM (Sadece UI Feedback)
    // =========================================================
    function _initMockFeedback() {
        document.getElementById('btnSaveNotifications')
            ?.addEventListener('click', () => {
                _toast('Bildirim tercihleri başarıyla kaydedildi.', 'check');
            });
            
        document.getElementById('btnSaveAppearance')
            ?.addEventListener('click', () => {
                _toast('Görünüm ve tema tercihiniz uygulandı.', 'check');
            });
    }

    // ─── Public Init ──────────────────────────────────────────────────
    function init() {
        _initTabs();
        _initProfileForm();
        _initPasswordForm();
        _initUserRoleSelects();
        _initToggleActiveButtons();
        _initEyeButtons();
        _initMockFeedback();
    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Settings JS Aktif!");
    SettingsPage.init();
});
