/**
 * Müşteri Yönetimi (CRM) Modülü Script Dosyası
 * Global Standart: Inline script kullanımı yasaktır.
 */

document.addEventListener('DOMContentLoaded', () => {
    // GLOBAL: Lucide ikonlarını initialize et
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // GLOBAL: Siparişler sayfasındaki filtre ve buton modeli uygulandı
    // Flatpickr Tarih Seçici Başlatma (image_8b8edf.png)
    if (typeof flatpickr !== 'undefined') {
        flatpickr(".flatpickr-date", {
            locale: "tr",
            dateFormat: "d.m.Y",
            allowInput: true,
            disableMobile: true
        });
    }

    // Arama Fonksiyonu (Global .ws-input-control üzerinden)
    const searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#customersTableBody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // GLOBAL: Müşteri Aktit/Pasif Durum Değiştirme (Toggle Status)
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            const icon = this.querySelector('i');

            try {
                const response = await fetch(`/Customers/ToggleStatus?id=${id}`, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // UI Güncelleme (Pürüzsüz UX)
                        const isActive = result.isActive;

                        // İkon rengini ve title'ı güncelle
                        icon.className = `ws-icon-16 lucide lucide-power ${isActive ? 'btn-status-active' : 'btn-status-passive'}`;
                        this.title = isActive ? 'Pasife Al' : 'Aktife Al';

                        // Tablodaki badge'i güncelle
                        const badge = document.getElementById(`badge-${id}`);
                        if (badge) {
                            badge.className = `ws-badge ${isActive ? 'ws-badge-soft-green' : 'ws-badge-soft-passive'}`;
                            badge.innerHTML = `<i data-lucide="${isActive ? 'check-circle' : 'x-circle'}" class="ws-icon-16"></i> ${isActive ? 'Aktif' : 'Pasif'}`;
                            lucide.createIcons(); // Yeni eklenen ikon için
                        }
                    }
                }
            } catch (error) {
                console.error('Toggle Error:', error);
            }
        });
    });

    // Yeni Müşteri Kayıt Fonksiyonu (AJAX - Premium UX)
    const createForm = document.getElementById('createCustomerForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(createForm);

            try {
                const response = await fetch('/Customers/Create', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        window.location.reload();
                    } else {
                        alert('Kayıt sırasında bir hata oluştu.');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Sunucuyla bağlantı kurulamadı.');
            }
        });
    }

    console.log('CRM Module - Global Standards & Toggle logic initialized');
});
