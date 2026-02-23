/**
 * SarapToptan ERP - Global JavaScript Controller
 * SidePanel (Drawer), GlobalUI (Modal/Sidebar) ve Global Effects
 */

/* ============================================================
   1. SIDE PANEL (DRAWER) MANTIĞI
   ============================================================ */
const SidePanel = {
    overlaySelector: '#sidePanelOverlay',
    panelSelector: '#sidePanel',
    contentSelector: '#sidePanelContent',
    titleSelector: '#sidePanelTitle',

    open: function (url, title = 'Yükleniyor...') {
        console.log('SidePanel: Loading URL:', url);
        $(this.titleSelector).text(title);
        $(this.contentSelector).html(`
            <div class="p-5 text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                <div class="mt-3 text-muted small fw-medium">Lütfen bekleyin...</div>
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
                this.refreshLucide();
                this.bindForm();
            },
            error: (err) => {
                console.error('SidePanel: AJAX Load Error:', err);
                this.showToast('İçerik yüklenirken bir hata oluştu.', 'alert-triangle');
                this.close();
            }
        });
    },

    close: function () {
        $(this.overlaySelector).removeClass('active');
        $(this.panelSelector).removeClass('active');
        $('body').css('overflow', 'auto');

        setTimeout(() => {
            $(this.contentSelector).empty();
        }, 400);
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
                        this.showToast(response.message || 'İşlem başarıyla tamamlandı!');
                        this.close();
                        this.refreshActiveTable();
                    } else {
                        $(this.contentSelector).html(response);
                        this.refreshLucide();
                        this.bindForm();
                    }
                },
                error: (err) => {
                    console.error('SidePanel: AJAX Post Error:', err);
                    this.showToast('Kaydedilirken bir hata oluştu.', 'alert-circle');
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
        this.refreshLucide();
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
                if (refreshed) this.refreshLucide();
                else window.location.reload();
            },
            error: () => window.location.reload()
        });
    },

    refreshLucide: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

/* ============================================================
    2. GLOBAL UI MANTIĞI (Modal, Sidebar, Helpers)
   ============================================================ */
const GlobalUI = {
    bsModal: null,

    init: function () {
        this.initSidebar();
        this.initNotifications();
        this.initTooltips();
        this.initDropdowns(); // Yeni eklenen dropdown dinleyicisi
        this.refreshLucide();
        console.log('GlobalUI: Initialized.');
    },

    initSidebar: function () {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebarClose = document.getElementById('sidebarClose');

        if (toggleBtn && sidebar && mainContent) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
                this.refreshLucide();
            });
        }

        if (sidebarClose && sidebar && mainContent) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
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

    // Modern Dropdown Etkileşimi
    initDropdowns: function () {
        // Dropdown her açıldığında içindeki Lucide ikonlarını canlandır
        $(document).on('shown.bs.dropdown', '.dropdown', () => {
            this.refreshLucide();
        });
    },

    openModal: function (url, modalSize = 'modal-md') {
        const modalEl = document.getElementById('productModal');
        const modalBody = document.getElementById('productModalBody');
        const modalDialog = document.getElementById('globalModalDialog');

        if (!modalEl || !modalBody) return;

        if (modalDialog) {
            modalDialog.className = 'modal-dialog modal-dialog-centered ' + modalSize;
        }

        modalBody.innerHTML = `
            <div class="p-5 text-center">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted small">Yükleniyor...</p>
            </div>`;

        this.bsModal = new bootstrap.Modal(modalEl);
        this.bsModal.show();

        $.get(url, (html) => {
            modalBody.innerHTML = html;
            this.refreshLucide();
        }).fail(() => {
            modalBody.innerHTML = '<div class="alert alert-danger m-3">Bir hata oluştu.</div>';
        });
    },

    refreshLucide: function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

/* ============================================================
    3. EVENT LISTENERLAR VE BAŞLATMA
   ============================================================ */
$(document).ready(function () {
    // GlobalUI Başlat
    GlobalUI.init();

    // SidePanel Universal Trigger [data-drawer="true"]
    $(document).on('click', '[data-drawer="true"]', function (e) {
        e.preventDefault();
        const url = $(this).attr('href') || $(this).data('url');
        const title = $(this).attr('title') || $(this).data('title') || 'Bilgiler';
        if (url) SidePanel.open(url, title);
    });

    // SidePanel Kapatma
    $(document).on('click', '#closeSidePanel, #sidePanelOverlay', function (e) {
        e.preventDefault();
        SidePanel.close();
    });

    // SidePanel içine tıklayınca kapanmasın
    $(document).on('click', '#sidePanel', function (e) {
        e.stopPropagation();
    });
});

/**
 * AJAX ile içerik değiştiğinde ikonları canlandır
 */
$(document).ajaxComplete(function () {
    GlobalUI.refreshLucide();
});

/* ============================================================
    4. YARDIMCI FONKSİYONLAR (GLOBAL)
   ============================================================ */
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}