using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers
{
    public class WarehousesController : BaseController
    {
        private readonly WineSpiritsContext _context;

        public WarehousesController(WineSpiritsContext context)
        {
            _context = context;
        }

        // Listeleme: Global Query Filter sayesinde IsDeleted=true olanlar gelmez.
        public async Task<IActionResult> Index()
        {
            return View(await _context.WareHouses.ToListAsync());
        }

        public IActionResult Create() => IsAjaxRequest ? PartialView() : View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,Location")] WareHouse wareHouse)
        {
            if (!ModelState.IsValid)
                return IsAjaxRequest ? PartialView(wareHouse) : View(wareHouse);

            // BaseEntity sayesinde Id ve CreatedDate otomatik yönetilebilir 
            // ama burada açıkça set etmek istersen:
            _context.Add(wareHouse);
            await _context.SaveChangesAsync();

            return IsAjaxRequest ? JsonSuccess("Depo başarıyla oluşturuldu.") : RedirectToAction(nameof(Index));
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            // 1. KONTROL: Yetki Kontrolü (BaseController'dan geliyor)
            if (!CanDelete)
            {
                return JsonError("Bu işlem için Müdür veya Müdür Yardımcısı yetkisi gereklidir!");
            }

            try
            {
                var wareHouse = await _context.WareHouses.FindAsync(id);
                if (wareHouse == null) return NotFound();

                // 2. KONTROL: İçinde ürün olan depo silinmesin (İş mantığı)
                if (await _context.Products.AnyAsync(p => p.WarehouseId == id))
                {
                    return JsonError("Bu depo içerisinde ürünler bulunduğu için arşive alınamaz!");
                }

                // 3. İŞLEM: Fiziksel silme yerine Soft Delete (Durum Güncelleme)
                wareHouse.IsDeleted = true;

                _context.Update(wareHouse); // Remove yerine Update kullanıyoruz
                await _context.SaveChangesAsync();

                return JsonSuccess("Depo başarıyla arşive kaldırıldı.");
            }
            catch (Exception ex)
            {
                // BaseController'daki hata yönetimini kullanıyoruz
                return JsonError("Bir hata oluştu: " + ex.Message);
            }
        }
    }
}