// SarapToptan ERP - Main JavaScript File

// Toggle sidebar functionality
function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

// Event listener for sidebar toggle
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleSidebar();
        });
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Check notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge && badge.innerText.trim() === '0') {
        badge.style.display = 'none';
    }
});

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Global UI Controller
const GlobalUI = {
    bsModal: null,
    // modalSize parametresi ekledik: 'ws-modal-md' (varsayılan), 'modal-lg' vb.
    openModal: function (url, modalSize = 'ws-modal-md') {
        const modalEl = document.getElementById('productModal');
        const modalBody = document.getElementById('productModalBody');
        const modalDialog = document.getElementById('globalModalDialog');

        if (!modalEl || !modalBody) return;

        // 1. Önceki boyutu temizle ve yenisini ekle
        modalDialog.className = 'modal-dialog modal-dialog-centered ' + modalSize;

        // 2. İçeriği temizle (Eski verinin görünmesini engeller)
        modalBody.innerHTML = `
            <div class="p-5 text-center">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted small">Yükleniyor...</p>
            </div>`;

        this.bsModal = new bootstrap.Modal(modalEl);
        this.bsModal.show();

        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.text())
            .then(html => {
                modalBody.innerHTML = html;
                this.refreshLucide(); // İkonları tazele
            })
            .catch(err => {
                modalBody.innerHTML = '<div class="alert alert-danger m-3">Bir hata oluştu.</div>';
            });
    },

    refreshLucide: function () {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};