/**
 * SarapToptan ERP - Global JavaScript Controller
 */

/* ============================================================
    1. SIDE PANEL (DRAWER) MANTIGI
   ============================================================ */
const SidePanel = {
    overlaySelector: '#sidePanelOverlay',
    panelSelector: '#sidePanel',
    contentSelector: '#sidePanelContent',
    titleSelector: '#sidePanelTitle',

    open: function (url, title = 'Yukleniyor...') {
        $('.modal-backdrop').remove();
        $(this.titleSelector).text(title);
        $(this.contentSelector).html(`
            <div class="p-5 text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                <div class="mt-3 text-muted small fw-medium">Lutfen bekleyin...</div>
            </div>
        `);

        $(this.overlaySelector).addClass('active');
        $(this.panelSelector).addClass('active');
        $('body').css('overflow', 'hidden');

        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {
                $(this.contentSelector).html(response);
                GlobalUI.refreshLucide(); // Global nesneyi kullanıyoruz
                this.bindForm();
            },
            error: (err) => {
                this.showToast('Icerik yuklenirken bir hata olustu.', 'alert-triangle');
                this.close();
            }
        });
    },

    close: function () {
        $(this.overlaySelector).removeClass('active');
        $(this.panelSelector).removeClass('active');
        $('body').css('overflow', 'auto');
        setTimeout(() => { $(this.contentSelector).empty(); }, 400);
    },

    bindForm: function () {
        const $form = $(this.contentSelector).find('form');
        if ($form.length === 0) return;

        $form.on('submit', (e) => {
            e.preventDefault();
            const url = $form.attr('action');
            const data = $form.serialize();
            const $btn = $form.find('button[type="submit"]');
            const originalBtnHtml = $btn.html();

            $btn.html('<span class="spinner-border spinner-border-sm me-2"></span> Kaydediliyor...').prop('disabled', true);

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: (response) => {
                    if (typeof response === 'object' && response.success) {
                        this.showToast(response.message || 'Islem basariyla tamamlandi!');
                        this.close();
                        this.refreshActiveTable();
                    } else {
                        $(this.contentSelector).html(response);
                        GlobalUI.refreshLucide();
                        this.bindForm();
                    }
                },
                error: (err) => {
                    this.showToast('Kaydedilirken bir hata olustu.', 'alert-circle');
                    $btn.html(originalBtnHtml).prop('disabled', false);
                }
            });
        });
    },

    showToast: function (message, icon = 'check-circle') {
        const $toast = $('#statusToast');
        if (!$toast.length) return;
        $('#toastMessage').text(message);
        $('#toastIcon').attr('data-lucide', icon);
        GlobalUI.refreshLucide();
        const toast = new bootstrap.Toast($toast[0]);
        toast.show();
    },

    refreshActiveTable: function () {
        const currentUrl = window.location.href;
        $.ajax({
            url: currentUrl,
            type: 'GET',
            success: (response) => {
                const containers = ['#productsTableContainer', '#suppliersTableContainer', '#customersTableContainer', '#categoriesTableContainer', '#unitsTableContainer', '#warehousesTableContainer'];
                let refreshed = false;
                containers.forEach(selector => {
                    const $newContent = $(response).find(selector);
                    if ($newContent.length > 0) {
                        $(selector).html($newContent.html());
                        refreshed = true;
                    }
                });
                if (refreshed) GlobalUI.refreshLucide();
                else window.location.reload();
            },
            error: () => window.location.reload()
        });
    }
};

/* ============================================================
    2. GLOBAL UI MANTIGI
   ============================================================ */
const GlobalUI = {
    bsModal: null,

    init: function () {
        this.initSidebar();
        this.initNotifications();
        this.initTooltips();
        this.initDropdowns();
        this.initDatePickers();
        this.refreshLucide();
    },

    initSidebar: function () {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn && sidebar && mainContent) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
                this.refreshLucide();
            });
        }
    },

    initNotifications: function () {
        const badge = document.getElementById('notificationBadge');
        if (badge && badge.innerText.trim() === '0') {
            badge.style.display = 'none';
        }
    },

    initTooltips: function () {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },

    initDropdowns: function () {
        const self = this;

        // Tıklama Olayı (Event Delegation)
        $(document).on('click', '.ws-custom-dropdown', function (e) {
            // Eğer tıklanan yer bir seçenek değilse dropdown'ı aç/kapat
            if (!$(e.target).closest('.ws-dropdown-option').length) {
                // Not: e.preventDefault() burada bazen input tıklamalarını bozabilir, dikkatli kullanıyoruz
                e.stopPropagation();

                const $this = $(this);

                // Diğerlerini kapat, seçileni tetikle
                $('.ws-custom-dropdown').not($this).removeClass('is-active');
                $this.toggleClass('is-active');

                self.refreshLucide();
            }
        });

        // Seçenek Seçildiğinde
        $(document).on('click', '.ws-dropdown-option', function (e) {
            e.stopPropagation();

            const $opt = $(this);
            const $dropdown = $opt.closest('.ws-custom-dropdown');
            const $label = $dropdown.find('.ws-filter-el span');

            // Eğer HTML'de onclick varsa e.preventDefault() onu durdurabilir. 
            // Hem onclick hem bu dinleyici varsa dikkat.
            if ($label.length) {
                $label.text($opt.text());
            }

            $dropdown.find('.ws-dropdown-option').removeClass('active');
            $opt.addClass('active');
            $dropdown.removeClass('is-active');

            self.refreshLucide();
        });

        // Dışarı Tıklandığında Kapatma
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.ws-custom-dropdown').length) {
                $('.ws-custom-dropdown').removeClass('is-active');
                self.refreshLucide();
            }
        });
    },

    initDatePickers: function () {
        if (typeof flatpickr !== 'undefined') {
            const self = this;
            $(".ws-datepicker").each(function() {
                const $this = $(this);
                flatpickr(this, {
                    mode: $this.data('mode') || "single",
                    dateFormat: "d.m.Y",
                    locale: "tr",
                    disableMobile: true,
                    onChange: (selectedDates, dateStr) => {
                        $this.trigger('change', [selectedDates, dateStr]);
                    }
                });
            });

            // Legacy support for #dateFilter specifically
            if (document.getElementById('dateFilter')) {
                flatpickr("#dateFilter", {
                    mode: "range",
                    dateFormat: "d.m.Y",
                    locale: "tr",
                    onChange: function() {
                        $(document).trigger('filter:changed');
                    }
                });
            }
        }
    },

    openModal: function (url, modalSize = 'modal-md') {
        $('.modal-backdrop').remove();
        const modalEl = document.getElementById('productModal');
        const modalBody = document.getElementById('productModalBody');
        const modalDialog = document.getElementById('globalModalDialog');

        if (!modalEl || !modalBody) return;
        if (modalDialog) modalDialog.className = 'modal-dialog modal-dialog-centered ' + modalSize;

        modalBody.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary" role="status"></div></div>';

        this.bsModal = new bootstrap.Modal(modalEl);
        this.bsModal.show();

        $.get(url, (html) => {
            modalBody.innerHTML = html;
            
            // Modal içindeki script'leri güvenli şekilde çalıştır
            setTimeout(() => {
                const scripts = $(modalBody).find('script');
                if (scripts.length > 0) {
                    scripts.each(function() {
                        const scriptContent = $(this).text();
                        if (scriptContent) {
                            try {
                                eval(scriptContent);
                            } catch (e) {
                                console.error('Modal script execution error:', e);
                            }
                        }
                    });
                }
            }, 100);
            
            // Lucide ikonlarını yenile, Select2 başlat ve formu bağla
            this.refreshLucide();
            this.initSelect2();
            this.bindModalForm();
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error('Modal AJAX Error:', {
                status: jqXHR.status,
                statusText: jqXHR.statusText,
                responseText: jqXHR.responseText,
                error: errorThrown
            });
            
            let errorMessage = 'İçerik yüklenemedi.';
            let errorIcon = 'alert-circle';
            
            // Hata mesajını detaylandır
            if (jqXHR.status === 500) {
                errorMessage = 'Sunucu hatası: Lütfen sistem yöneticisiyle iletişime geçin.';
                errorIcon = 'server';
            } else if (jqXHR.status === 404) {
                errorMessage = 'Sayfa bulunamadı: İstenen içerik mevcut değil.';
                errorIcon = 'file-x';
            } else if (jqXHR.status === 403) {
                errorMessage = 'Yetki hatası: Bu işlem için yetkiniz yok.';
                errorIcon = 'shield-x';
            }
            
            modalBody.innerHTML = `<div class="p-5 text-center">
                <div class="text-danger mb-3">
                    <i data-lucide="${errorIcon}" style="width: 32px; height: 32px; margin-bottom: 1rem;"></i>
                    <div class="mt-2 fw-bold">${errorMessage}</div>
                    ${jqXHR.status === 500 ? '<div class="mt-2 text-muted small">Hata Kodu: 500 - Internal Server Error</div>' : ''}
                </div>
                <button class="btn btn-secondary mt-3" onclick="GlobalUI.closeModal()">Kapat</button>
            </div>`;
            
            // İkonları yenile
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        });

        // Lucide ikonlarını yenile
        this.refreshLucide();
    },
    
    closeModal: function () {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    },
    
    refreshLucide: function () {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    },
    
    initSelect2: function () {
        if (typeof $ !== 'undefined' && $.fn.select2) {
            $('.select2-enable').each(function() {
                const $el = $(this);
                if ($el.hasClass('select2-hidden-accessible')) return; 
                
                const $modalParent = $el.closest('.modal');
                $el.select2({
                    theme: 'default',
                    width: '100%',
                    placeholder: 'Seçiniz...',
                    dropdownParent: $modalParent.length ? $modalParent : $(document.body)
                });
            });
        }
    },

    bindModalForm: function () {
        const modalBody = document.getElementById('productModalBody');
        const $form = $(modalBody).find('form');
        if ($form.length === 0) return;

        $form.on('submit', (e) => {
            e.preventDefault();
            const url = $form.attr('action');
            const data = new FormData($form[0]);
            const $btn = $form.find('button[type="submit"]');
            const originalBtnHtml = $btn.html();

            $btn.html('<span class="spinner-border spinner-border-sm me-2"></span> İşleniyor...').prop('disabled', true);

            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                processData: false,
                contentType: false,
                success: (response) => {
                    if (typeof response === 'object' && response.success) {
                        SidePanel.showToast(response.message || 'İşlem başarıyla tamamlandı!');
                        this.closeModal();
                        setTimeout(() => window.location.reload(), 800);
                    } else if (response.toString().includes('ws-modal-body')) {
                        // Eğer validation hatası dönerse modalı güncelle
                        modalBody.innerHTML = response;
                        this.refreshLucide();
                        this.initSelect2();
                        this.bindModalForm();
                    } else {
                        window.location.reload();
                    }
                },
                error: (err) => {
                    SidePanel.showToast('Kaydedilirken bir hata oluştu.', 'alert-circle');
                    $btn.html(originalBtnHtml).prop('disabled', false);
                }
            });
        });
    }
};

/* ============================================================
    3. EVENT LISTENERLAR VE BASLATMA
   ============================================================ */
$(document).ready(function () {
    GlobalUI.init();

    $(document).on('click', '[data-drawer="true"]', function (e) {
        e.preventDefault();
        const url = $(this).attr('href') || $(this).data('url');
        const title = $(this).attr('title') || $(this).data('title');
        if (url) SidePanel.open(url, title);
    });

    $(document).on('click', '#closeSidePanel, #sidePanelOverlay', function (e) {
        e.preventDefault();
        SidePanel.close();
    });
});

// Ajax işlemleri sonrası ikonları otomatik yenile
$(document).ajaxComplete(function () {
    GlobalUI.refreshLucide();
});

// Sayfa tamamen yüklendiğinde ikonları garantile
window.addEventListener('load', () => {
    GlobalUI.refreshLucide();
});