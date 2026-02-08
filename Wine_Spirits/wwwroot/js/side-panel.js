/**
 * SidePanel Object: Core logic for Drawer UI
 * Optimized for "Soft & Floating" design and Universal Module Support
 */
const SidePanel = {
    overlaySelector: '#sidePanelOverlay',
    panelSelector: '#sidePanel',
    contentSelector: '#sidePanelContent',
    titleSelector: '#sidePanelTitle',

    /**
     * Opens the panel and loads content via AJAX
     */
    open: function (url, title = 'Yükleniyor...') {
        console.log('SidePanel: Loading URL:', url);
        $(this.titleSelector).text(title);
        $(this.contentSelector).html(`
            <div class="p-5 text-center">
                <div class="spinner-border text-indigo" role="status" style="width: 3rem; height: 3rem;"></div>
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
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                this.bindForm();
            },
            error: (err) => {
                console.error('SidePanel: AJAX Load Error:', err);
                this.showToast('İçerik yüklenirken bir hata oluştu.', 'alert-triangle');
                this.close();
            }
        });
    },

    /**
     * Closes the panel and resets state
     */
    close: function () {
        $(this.overlaySelector).removeClass('active');
        $(this.panelSelector).removeClass('active');
        $('body').css('overflow', 'auto');

        setTimeout(() => {
            $(this.contentSelector).empty();
        }, 400);
    },

    /**
     * Binds AJAX submission to form inside the panel
     */
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
                        this.showToast('İşlem başarıyla tamamlandı!');
                        this.close();
                        this.refreshActiveTable();
                    } else {
                        // Re-render form with validation errors (PartialView)
                        $(this.contentSelector).html(response);
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
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

    /**
     * Displays a modern toast notification
     */
    showToast: function (message, icon = 'check-circle') {
        const $toast = $('#statusToast');
        if (!$toast.length) return;

        $('#toastMessage').text(message);
        $('#toastIcon').attr('data-lucide', icon);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        const toast = new bootstrap.Toast($toast[0]);
        toast.show();
    },

    /**
     * Refreshes the active table/list on the page
     */
    refreshActiveTable: function () {
        const currentUrl = window.location.href;
        console.log('SidePanel: Refreshing view from:', currentUrl);

        $.ajax({
            url: currentUrl,
            type: 'GET',
            success: (response) => {
                // Look for common table containers
                const containers = ['#productsTableContainer', '#suppliersTableContainer', '#customersTableContainer', '#categoriesTableContainer', '#unitsTableContainer'];
                let refreshed = false;

                containers.forEach(selector => {
                    const $newContent = $(response).find(selector);
                    if ($newContent.length > 0) {
                        $(selector).html($newContent.html());
                        refreshed = true;
                        console.log(`SidePanel: Container ${selector} refreshed.`);
                    }
                });

                if (refreshed) {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    console.warn('SidePanel: No matching refresh container found, reloading full page.');
                    window.location.reload();
                }
            },
            error: (err) => {
                console.error('SidePanel: Refresh Error:', err);
                window.location.reload();
            }
        });
    }
};

/**
 * Global Event Delegation (Universal Selector)
 */
$(document).ready(function () {
    // 1. Universal Trigger for [data-drawer="true"]
    $(document).on('click', '[data-drawer="true"]', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const url = $(this).attr('href') || $(this).data('url');
        const title = $(this).attr('title') || $(this).data('title') || 'Bilgiler';

        if (url) {
            SidePanel.open(url, title);
        } else {
            console.error('SidePanel: Link missing href/data-url.');
        }

        return false;
    });

    // 2. Global Close Listeners
    $(document).on('click', '#closeSidePanel, #sidePanelOverlay', function (e) {
        e.preventDefault();
        SidePanel.close();
    });

    // 3. Prevent clicks on panel from closing it
    $(document).on('click', '#sidePanel', function (e) {
        e.stopPropagation();
    });
});
