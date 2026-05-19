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
 *    8. Tanımlamalar: Ülke / Şehir / Kategori kayıt ekleme
 *    9. ws-notify: Sayfa içi lüks bildirim balonu sistemi
 * ============================================================
 */

const SettingsPage = (() => {

    // ─── CSRF token ────────────────────────────────────────────────────
    function _csrfToken() {
        return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
    }

    // =========================================================
    // WS-NOTIFY — Sayfa-içi Lüks Bildirim Balonu Motoru
    // =========================================================
    const _WsNotify = (() => {
        const CONTAINER_ID = 'ws-notify-container';
        const DURATION_MS  = 3200;   // otomatik kapanma süresi
        const FADE_MS      = 380;    // fadeOut animasyon süresi

        // Tip → görsel ayarlar
        const VARIANTS = {
            success: {
                icon:     'check-circle',
                gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                accent:   'rgba(124,58,237,0.18)',
                iconClr:  '#c4b5fd',
            },
            error: {
                icon:     'alert-circle',
                gradient: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                accent:   'rgba(220,38,38,0.18)',
                iconClr:  '#fca5a5',
            },
            info: {
                icon:     'info',
                gradient: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                accent:   'rgba(37,99,235,0.18)',
                iconClr:  '#93c5fd',
            },
            warning: {
                icon:     'alert-triangle',
                gradient: 'linear-gradient(135deg,#d97706,#b45309)',
                accent:   'rgba(217,119,6,0.18)',
                iconClr:  '#fcd34d',
            },
        };

        /** Kapsayıcıyı al veya oluştur */
        function _getContainer() {
            let c = document.getElementById(CONTAINER_ID);
            if (!c) {
                c = document.createElement('div');
                c.id = CONTAINER_ID;
                c.setAttribute('aria-live', 'polite');
                c.setAttribute('aria-atomic', 'false');
                document.body.appendChild(c);
            }
            return c;
        }

        /** Tek bir toast öğesi oluştur ve DOM'a ekle */
        function show(message, type = 'success') {
            const v   = VARIANTS[type] ?? VARIANTS.success;
            const ctr = _getContainer();

            // ── Öğe ──
            const el = document.createElement('div');
            el.className = 'ws-notify-toast';
            el.setAttribute('role', 'alert');
            el.innerHTML = `
                <div class="ws-notify-stripe" style="background:${v.gradient};"></div>
                <div class="ws-notify-icon-wrap" style="background:${v.accent};">
                    <i data-lucide="${v.icon}" style="color:${v.iconClr};"></i>
                </div>
                <p class="ws-notify-msg">${message}</p>
                <button class="ws-notify-close" aria-label="Kapat">
                    <i data-lucide="x"></i>
                </button>
            `;

            ctr.appendChild(el);

            // Lucide ikonlarını render et
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Kapatma butonu
            el.querySelector('.ws-notify-close')
              .addEventListener('click', () => _dismiss(el));

            // Otomatik kapanma zamanlayıcısı
            const timer = setTimeout(() => _dismiss(el), DURATION_MS);

            // Hover'da sayacı durdur
            el.addEventListener('mouseenter', () => clearTimeout(timer));
            el.addEventListener('mouseleave', () => {
                const t2 = setTimeout(() => _dismiss(el), DURATION_MS);
                el._autoTimer = t2;
            });
            el._autoTimer = timer;

            // Giriş animasyonunu tetikle (bir tick bekle)
            requestAnimationFrame(() => el.classList.add('ws-notify-toast--visible'));
        }

        /** Toast'ı fadeOut yaparak DOM'dan kaldır */
        function _dismiss(el) {
            if (!el || el.classList.contains('ws-notify-toast--leaving')) return;
            clearTimeout(el._autoTimer);
            el.classList.add('ws-notify-toast--leaving');
            setTimeout(() => el.remove(), FADE_MS);
        }

        return { show };
    })();

    // ─── _toast: Mevcut çağrı noktalarıyla geriye-dönük uyumluluk ──────
    //     icon parametresi: 'check' → success, diğerleri → error
    function _toast(msg, icon = 'check') {
        const type = (icon === 'check' || icon === 'check-circle')
                   ? 'success'
                   : (icon === 'info' ? 'info'
                   : (icon === 'alert-triangle' ? 'warning'
                   : 'error'));
        _WsNotify.show(msg, type);
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
    // 7. BİLDİRİM TERCİHLERİ (Mock Feedback)
    // =========================================================
    function _initMockFeedback() {
        document.getElementById('btnSaveNotifications')
            ?.addEventListener('click', () => {
                _toast('Bildirim tercihleri başarıyla kaydedildi.', 'check');
            });
    }

    // =========================================================
    // 8. TANIMLAMALAR MODÜLÜ — Ülke / Şehir / Kategori (Edit/Delete Destekli)
    // =========================================================
    function _initDefinitions() {
        const typeLabels = { country: 'Ülke', city: 'Şehir', category: 'Kategori' };

        // Kaydet / Güncelle butonu click event'i
        document.querySelectorAll('.stg-def-save-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                _defSave(this, typeLabels);
            });

            // Enter tuşuna basıldığında ekleme/güncelleme yapma desteği
            const inputEl = document.getElementById(btn.dataset.input);
            inputEl?.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Düzenleme ve Silme aksiyonları için event delegation (tbody listeleri üzerinden)
        document.querySelectorAll('[id^="list"]').forEach(listEl => {
            listEl.addEventListener('click', function(e) {
                const editBtn = e.target.closest('.stg-btn-edit');
                const deleteBtn = e.target.closest('.stg-btn-delete');

                if (editBtn) {
                    _defEdit(editBtn);
                } else if (deleteBtn) {
                    _defDelete(deleteBtn, typeLabels);
                }
            });
        });
    }

    // Satır düzenleme modunu başlatma
    function _defEdit(btn) {
        const row = btn.closest('tr');
        const listEl = row.closest('tbody');
        const block = row.closest('.stg-def-block');
        const saveBtn = block.querySelector('.stg-def-save-btn');
        const inputEl = block.querySelector('.stg-def-input');

        if (!row || !saveBtn || !inputEl) return;

        // Eğer başka bir satır düzenleniyorsa onun düzenleme modunu sıfırla
        listEl.querySelectorAll('.stg-row-editing').forEach(el => {
            el.classList.remove('stg-row-editing');
        });

        // Satırı düzenleme moduna al ve arka planı vurgula
        row.classList.add('stg-row-editing');
        
        // Değeri input alanına çek
        const valueName = row.querySelector('.stg-def-name').textContent.trim();
        inputEl.value = valueName;
        inputEl.focus();

        // Butonu Güncelleme durumuna çek (Lüks mor tasarımı bozmadan check ikonu veriyoruz)
        saveBtn.classList.add('stg-btn-editing-active');
        saveBtn.innerHTML = '<i data-lucide="check"></i><span>Güncelle</span>';
        saveBtn.dataset.editingRowVal = row.getAttribute('data-val'); // Orijinal değeri sakla
        _refreshIcons();
    }

    // Kayıt silme işlemi
    function _defDelete(btn, typeLabels) {
        const row = btn.closest('tr');
        const type = btn.dataset.type;
        const val = row.getAttribute('data-val');

        if (!row) return;

        // Silme animasyonu uygula (tabloda pürüzsüz kaybolma)
        row.classList.add('stg-row-deleting');
        setTimeout(() => {
            row.remove();
            _toast(`"${val}" ${typeLabels[type] ?? 'kayıt'} başarıyla silindi.`, 'success');
        }, 300);
    }

    // Ekleme veya Güncelleme kaydetme işlemi
    function _defSave(btn, typeLabels) {
        const type    = btn.dataset.type;
        const inputEl = document.getElementById(btn.dataset.input);
        const listEl  = document.getElementById(btn.dataset.list);
        if (!inputEl || !listEl) return;

        const value = inputEl.value.trim();
        if (!value) {
            inputEl.focus();
            _toast(`Lütfen bir ${typeLabels[type] ?? 'kayıt'} adı girin.`, 'warning');
            return;
        }

        const isEditing = btn.dataset.editingRowVal !== undefined;
        const oldVal = btn.dataset.editingRowVal;

        // Büyük/Küçük harf duyarsız (Case-insensitive) mükerrer kontrolü
        // Türkçe karakterlerin (İ/i, I/ı) doğru eşleşmesi için toLocaleLowerCase('tr-TR') kullanıyoruz.
        const valueLower = value.toLocaleLowerCase('tr-TR');
        
        const existingRows = Array.from(listEl.querySelectorAll('tr'));
        let isDuplicate = false;

        for (let row of existingRows) {
            // Eğer düzenleme modundaysak, düzenlenen satırın eski değerini mükerrer kontrolünde es geç
            if (isEditing && row.getAttribute('data-val').toLocaleLowerCase('tr-TR') === oldVal.toLocaleLowerCase('tr-TR')) {
                continue;
            }
            const nameText = row.querySelector('.stg-def-name').textContent.trim().toLocaleLowerCase('tr-TR');
            if (nameText === valueLower) {
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            _toast(`"${value}" zaten kayıtlı.`, 'error');
            inputEl.focus();
            return;
        }

        if (isEditing) {
            // Düzenlenen satırı bul ve içeriğini güncelle
            const row = listEl.querySelector(`.stg-row-editing`);
            if (row) {
                row.setAttribute('data-val', value);
                row.querySelector('.stg-def-name').textContent = value;
                row.classList.remove('stg-row-editing');
            }

            // Butonu tekrar "Ekle" moduna çek
            btn.classList.remove('stg-btn-editing-active');
            btn.innerHTML = '<i data-lucide="plus"></i><span>Ekle</span>';
            delete btn.dataset.editingRowVal;

            _toast(`${typeLabels[type] ?? 'Kayıt'} başarıyla güncellendi: "${value}"`, 'success');
        } else {
            // Yeni bir tablo satırı oluştur ve ekle
            const tr = document.createElement('tr');
            tr.setAttribute('data-val', value);
            tr.className = 'stg-def-row--new'; // yeni eklendiğinde pürüzsüz animasyon tetiklemesi
            tr.innerHTML = `
                <td class="stg-def-name">${value}</td>
                <td class="stg-def-actions">
                    <button type="button" class="stg-def-action-btn stg-btn-edit" title="Düzenle" data-type="${type}"><i data-lucide="edit-2"></i></button>
                    <button type="button" class="stg-def-action-btn stg-btn-delete" title="Sil" data-type="${type}"><i data-lucide="trash-2"></i></button>
                </td>
            `;

            listEl.appendChild(tr);

            // Animasyon tamamlandığında sınıfı temizle
            tr.addEventListener('animationend', () => {
                tr.classList.remove('stg-def-row--new');
            }, { once: true });

            _toast(`${typeLabels[type] ?? 'Kayıt'} başarıyla eklendi: "${value}"`, 'success');
        }

        // Input'u temizle ve odağı orada tut
        inputEl.value = '';
        inputEl.focus();
        _refreshIcons();
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
        _initDefinitions();
    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Settings JS Aktif!");
    SettingsPage.init();
});
