using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;
using System.Globalization;

namespace Wine_Spirits.Controllers
{
    public class SuppliersController : Controller
    {
        private readonly WineSpiritsContext _context;

        public SuppliersController(WineSpiritsContext context)
        {
            _context = context;
        }

        // GET: Suppliers
        public async Task<IActionResult> Index()
        {
            // Context'teki Global Query Filter sayesinde IsDeleted kontrolüne gerek yok.
            var suppliers = await _context.Suppliers
                .Include(s => s.Country)
                .Include(s => s.Products)
                    .ThenInclude(p => p.StockMovements)
                .ToListAsync();

            // Ciro hesaplama mantığı (decimal olarak hesaplanıp string'e çevrilecek)
            decimal totalPurchaseDecimal = 0;
            foreach (var supplier in suppliers)
            {
                if (supplier.Products != null)
                {
                    foreach (var product in supplier.Products)
                    {
                        var inMovements = product.StockMovements?
                            .Where(sm => sm.MovementType == "IN")
                            .Sum(sm => (decimal?)sm.Quantity) ?? 0;

                        totalPurchaseDecimal += inMovements * product.Price;
                    }
                }
            }

            var viewModel = new SuppliersIndexViewModel
            {
                Suppliers = suppliers,
                Stats = new SupplierStats
                {
                    TotalSuppliers = suppliers.Count,
                    ActiveSuppliers = suppliers.Count(s => s.IsActive),
                    TotalProducts = suppliers.Sum(s => s.Products?.Count ?? 0),
                    // HATA ÇÖZÜMÜ: Decimal değeri ViewModel'in beklediği string formatına çeviriyoruz.
                    TotalPurchase = totalPurchaseDecimal.ToString("C2", new CultureInfo("tr-TR"))
                }
            };

            return View(viewModel);
        }

        // GET: Suppliers/Create
        public IActionResult Create()
        {
            ViewData["CountryId"] = new SelectList(_context.Countries, "Id", "Name");
            ViewData["WarehouseId"] = new SelectList(_context.WareHouses, "Id", "Name");

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_SupplierFormPartial", new Supplier()); // Boş model ile gönder

            return View();
        }

        // POST: Suppliers/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Name,Phone,Email,CountryId,WarehouseId")] Supplier supplier)
        {
            if (ModelState.IsValid)
            {
                supplier.Id = Guid.NewGuid();
                supplier.CreatedDate = DateTime.Now;
                supplier.IsActive = true;
                supplier.IsDeleted = false;

                _context.Add(supplier);
                await _context.SaveChangesAsync();

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                    return Json(new { success = true });

                return RedirectToAction(nameof(Index));
            }

            // HATA DURUMU: SelectList'leri tekrar doldur
            ViewData["CountryId"] = new SelectList(_context.Countries, "Id", "Name", supplier.CountryId);
            ViewData["WarehouseId"] = new SelectList(_context.WareHouses, "Id", "Name", supplier.WarehouseId);

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_SupplierFormPartial", supplier); // Hataları gösteren partial

            return View(supplier);
        }

        // GET: Suppliers/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null) return NotFound();

            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            ViewData["CountryId"] = new SelectList(_context.Countries, "Id", "Name", supplier.CountryId);
            ViewData["WarehouseId"] = new SelectList(_context.WareHouses, "Id", "Name", supplier.WarehouseId);

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_SupplierFormPartial", supplier);

            return View(supplier);
        }

        // POST: Suppliers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Phone,Email,CountryId,WarehouseId,IsActive,CreatedDate")] Supplier supplier)
        {
            if (id != supplier.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    // IsDeleted flag'ini koru (Bind edilmediği için veritabanından takip edilmeli veya manuel set edilmeli)
                    supplier.IsDeleted = false;
                    _context.Update(supplier);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SupplierExists(supplier.Id)) return NotFound();
                    throw;
                }

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                    return Json(new { success = true });

                return RedirectToAction(nameof(Index));
            }

            ViewData["CountryId"] = new SelectList(_context.Countries, "Id", "Name", supplier.CountryId);
            ViewData["WarehouseId"] = new SelectList(_context.WareHouses, "Id", "Name", supplier.WarehouseId);

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_SupplierFormPartial", supplier);

            return View(supplier);
        }

        // POST: Suppliers/ToggleStatus/5
        [HttpPost]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            supplier.IsActive = !supplier.IsActive;
            await _context.SaveChangesAsync();

            return Json(new { success = true, isActive = supplier.IsActive });
        }

        // POST: Suppliers/SoftDelete/5
        [HttpPost]
        public async Task<IActionResult> SoftDelete(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            supplier.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }

        private bool SupplierExists(Guid id)
        {
            return _context.Suppliers.Any(e => e.Id == id);
        }
    }
}