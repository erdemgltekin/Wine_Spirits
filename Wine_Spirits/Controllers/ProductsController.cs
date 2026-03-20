using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers
{
    public class ProductsController : Controller
    {
        private readonly WineSpiritsContext _context;

        public ProductsController(WineSpiritsContext context) => _context = context;

        // INDEX: Ana sayfa yükleme
        public IActionResult Index() => View();

        // GET: Products/Details/id
        [HttpGet]
        public async Task<IActionResult> Details(Guid id)
        {
            var product = await _context.Products
                .Include(p => p.Country).Include(p => p.ProductCategory)
                .Include(p => p.ProductDefinition).Include(p => p.Supplier)
                .Include(p => p.Unit).Include(p => p.Warehouse)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (product == null) return NotFound();

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_ProductDetailsPartial", product); // Detay partial ismin buysa

            return View(product);
        }

        // GET: Products/Create
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            try
            {
                await PopulateSelectListsAsync();
                ViewBag.Years = new SelectList(Enumerable.Range(2000, DateTime.Now.Year - 1999 + 5).OrderByDescending(x => x));

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                    return PartialView("_ProductFormPartial", new Product());

                return View(new Product());
            }
            catch (Exception ex)
            {
                return HandleError(ex, "Create GET");
            }
        }

        // POST: Products/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product)
        {
            RemoveNavigations();

            if (ModelState.IsValid)
            {
                try
                {
                    if (product.WarehouseId == null || product.WarehouseId == Guid.Empty)
                    {
                        var defaultWh = await _context.WareHouses.FirstOrDefaultAsync();
                        if (defaultWh != null) product.WarehouseId = defaultWh.Id;
                    }

                    product.Id = Guid.NewGuid();
                    _context.Add(product);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true, message = "Ürün başarıyla kaydedildi." });
                }
                catch (Exception ex) { return Json(new { success = false, message = ex.Message }); }
            }
            return Json(new { success = false, message = "Veri hatası!" });
        }

        // GET: Products/Edit/id
        [HttpGet]
        public async Task<IActionResult> Edit(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            await PopulateSelectListsAsync(product);
            ViewBag.Years = new SelectList(Enumerable.Range(2000, DateTime.Now.Year - 1999 + 5).OrderByDescending(x => x), product.Year);

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_ProductFormPartial", product);

            return View(product);
        }

        // POST: Products/Edit/id
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, Product product)
        {
            if (id != product.Id) return Json(new { success = false, message = "ID uyuşmazlığı." });
            RemoveNavigations();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(product);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true, message = "Güncellendi." });
                }
                catch (Exception ex) { return Json(new { success = false, message = ex.Message }); }
            }
            return Json(new { success = false, message = "Doğrulama hatası." });
        }

        // POST: Products/Delete/id (AJAX ile çalışır)
        [HttpPost]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return Json(new { success = false, message = "Ürün bulunamadı." });

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Ürün silindi." });
            }
            catch (Exception ex) { return Json(new { success = false, message = ex.Message }); }
        }

        // API: Tablo Verisi
        [HttpGet]
        public async Task<IActionResult> GetProductsData()
        {
            var data = await _context.Products
                .Include(p => p.ProductDefinition).Include(p => p.ProductCategory)
                .Include(p => p.Unit).Include(p => p.Supplier).Include(p => p.Country)
                .AsNoTracking()
                .Select(p => new {
                    id = p.Id,
                    productCode = "WS-" + p.Id.ToString().Substring(0, 5).ToUpper(),
                    name = p.ProductDefinition.Name,
                    categoryName = p.ProductCategory.Name,
                    price = p.Price,
                    stockQuantity = p.StockQuantity,
                    unitName = p.Unit.Name,
                    supplierName = p.Supplier.Name,
                    countryName = p.Country.Name
                }).ToListAsync();

            return Json(new { products = data });
        }

        // --- HELPER METOTLAR ---

        private void RemoveNavigations()
        {
            string[] navs = { "Country", "ProductCategory", "ProductDefinition", "Supplier", "Unit", "Warehouse" };
            foreach (var nav in navs) ModelState.Remove(nav);
        }

        private async Task PopulateSelectListsAsync(Product p = null)
        {
            var countries = await _context.Countries.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
            var categories = await _context.ProductCategories.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
            var definitions = await _context.ProductDefinitions.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
            var suppliers = await _context.Suppliers.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
            var units = await _context.Units.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
            var warehouses = await _context.WareHouses.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

            ViewBag.CountryId = new SelectList(countries, "Id", "Name", p?.CountryId);
            ViewBag.ProductCategoryId = new SelectList(categories, "Id", "Name", p?.ProductCategoryId);
            ViewBag.ProductDefinitionId = new SelectList(definitions, "Id", "Name", p?.ProductDefinitionId);
            ViewBag.SupplierId = new SelectList(suppliers, "Id", "Name", p?.SupplierId);
            ViewBag.UnitId = new SelectList(units, "Id", "Name", p?.UnitId);
            ViewBag.WarehouseId = new SelectList(warehouses, "Id", "Name", p?.WarehouseId);
        }

        private IActionResult HandleError(Exception ex, string context)
        {
            Console.WriteLine($"{context} Error: {ex.Message}");
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                Response.StatusCode = 500;
                return Content($"Hata ({context}): {ex.Message}");
            }
            return View("Error");
        }
    }
}