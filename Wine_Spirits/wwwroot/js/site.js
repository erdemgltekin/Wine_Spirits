// SarapToptan ERP - Main JavaScript File

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (window.innerWidth < 992) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    }
}

// Toggle order expansion
function toggleOrder(orderId) {
    const url = new URL(window.location.href);
    if (url.searchParams.get('expandId') === orderId) {
        url.searchParams.delete('expandId');
    } else {
        url.searchParams.set('expandId', orderId);
    }
    window.location.href = url.toString();
}

// Open return modal
function openReturnModal(orderId, itemIndex, maxQuantity) {
    document.getElementById('returnOrderId').value = orderId;
    document.getElementById('returnItemIndex').value = itemIndex;
    document.getElementById('returnQuantity').max = maxQuantity;
    document.getElementById('maxQuantity').textContent = maxQuantity;

    const modal = new bootstrap.Modal(document.getElementById('returnModal'));
    modal.show();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date
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

// Initialize tooltips
$(document).ready(function () {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (window.innerWidth > 991) {
        // Masaüstü görünümü için
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    } else {
        // Mobil görünümü için
        sidebar.classList.toggle('active');
    }
}

// Sayfa yüklendiğinde Lucide ikonlarını başlatmayı unutmayın
document.addEventListener("DOMContentLoaded", function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});