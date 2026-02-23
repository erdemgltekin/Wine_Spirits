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

        // Listeleme
        public async Task<IActionResult> Index()
        {
            var warehouses = await _context.WareHouses
                .OrderByDescending(w => w.CreatedDate)
                .ToListAsync();
            return View(warehouses);
        }

        // GET: Create
        public IActionResult Create()
        {
            return IsAjaxRequest ? PartialView("_WarehouseFormPartial") : View();
        }

        // POST: Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,Location")] WareHouse wareHouse)
        {
            if (!ModelState.IsValid)
                // HATA DÜZELTİLDİ: Dosya ismi _WarehouseFormPartial yapıldı
                return IsAjaxRequest ? PartialView("_WarehouseFormPartial", wareHouse) : View(wareHouse);

            try
            {
                _context.Add(wareHouse);
                await _context.SaveChangesAsync();

                return IsAjaxRequest
                    ? JsonSuccess("Depo başarıyla oluşturuldu.")
                    : RedirectToAction(nameof(Index));
            }
            catch (Exception)
            {
                return IsAjaxRequest
                    ? JsonError("Depo kaydedilirken teknik bir sorun oluştu.")
                    : View(wareHouse);
            }
        }

        // GET: Edit
        public async Task<IActionResult> Edit(Guid id)
        {
            var wareHouse = await _context.WareHouses.FindAsync(id);
            if (wareHouse == null) return NotFound();

            // Dosya ismi ortak form yapıldı
            return IsAjaxRequest ? PartialView("_WarehouseFormPartial", wareHouse) : View(wareHouse);
        }

        // POST: Edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Location,CreatedDate")] WareHouse wareHouse)
        {
            if (id != wareHouse.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(wareHouse);
                    await _context.SaveChangesAsync();
                    return IsAjaxRequest ? JsonSuccess("Depo bilgileri güncellendi.") : RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.WareHouses.AnyAsync(e => e.Id == wareHouse.Id)) return NotFound();
                    throw;
                }
            }

            // HATA DÜZELTİLDİ: Dosya ismi _WarehouseFormPartial yapıldı
            return IsAjaxRequest ? PartialView("_WarehouseFormPartial", wareHouse) : View(wareHouse);
        }

        // POST: Delete (Soft Delete)
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            if (!CanDelete)
            {
                return JsonError("Bu işlem için yönetici yetkisi gereklidir!");
            }

            try
            {
                var wareHouse = await _context.WareHouses.FindAsync(id);
                if (wareHouse == null) return NotFound();

                var hasProducts = await _context.Products.AnyAsync(p => p.WarehouseId == id);
                if (hasProducts)
                {
                    return JsonError("Bu depoda kayıtlı ürünler olduğu için arşive alınamaz!");
                }

                wareHouse.IsDeleted = true;
                _context.Update(wareHouse);
                await _context.SaveChangesAsync();

                return JsonSuccess("Depo başarıyla arşive kaldırıldı.");
            }
            catch (Exception ex)
            {
                return JsonError("Sistem hatası: " + ex.Message);
            }
        }
    }
}