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

        public IActionResult Index() => View();

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            try
            {
                await PopulateSelectListsAsync();

                // AJAX çağrısı ise sadece Formu (Partial), normal çağrı ise Create.cshtml'i (View) dön
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                    return PartialView("_CreateProductPartial", new Product());

                return View(new Product());
            }
            catch (Exception ex)
            {
                // Log the exact error for debugging
                Console.WriteLine($"Create GET Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                // Return error response for AJAX calls
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    Response.StatusCode = 500;
                    return Content($"Internal Server Error: {ex.Message}", "text/plain");
                }
                
                return View("Error");
            }
        }

        [HttpGet]
        public async Task<IActionResult> Edit(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            PopulateSelectLists(product);

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_ProductFormPartial", product);

            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product)
        {
            // 1. ADIM: İlişkisel nesneleri doğrulamadan çıkar (Hata almanı engeller)
            string[] navs = { "Country", "ProductCategory", "ProductDefinition", "Supplier", "Unit", "Warehouse" };
            foreach (var nav in navs) ModelState.Remove(nav);

            // 2. ADIM: Kritik ID Kontrolleri
            if (product.UnitId == Guid.Empty) ModelState.AddModelError("UnitId", "Lütfen bir ölçü birimi seçin.");
            if (product.ProductDefinitionId == Guid.Empty) ModelState.AddModelError("ProductDefinitionId", "Lütfen bir ürün tanımı seçin.");

            if (ModelState.IsValid)
            {
                try
                {
                    // Depo kontrolü
                    if (product.WarehouseId == null || product.WarehouseId == Guid.Empty)
                    {
                        var defaultWh = await _context.WareHouses.FirstOrDefaultAsync();
                        if (defaultWh != null) product.WarehouseId = defaultWh.Id;
                        else return Json(new { success = false, message = "Sistemde tanımlı depo bulunamadı." });
                    }

                    product.Id = Guid.NewGuid();
                    _context.Add(product);
                    await _context.SaveChangesAsync();

                    return Json(new { success = true, message = "Ürün başarıyla kaydedildi." });
                }
                catch (DbUpdateException ex)
                {
                    var inner = ex.InnerException?.Message ?? ex.Message;
                    // Görseldeki hatayı burada yakalıyoruz
                    if (inner.Contains("FK_Product_Unit"))
                        return Json(new { success = false, message = "Hata: Seçtiğiniz Birim veritabanında kayıtlı değil." });

                    return Json(new { success = false, message = "Veritabanı hatası: " + inner });
                }
            }

            // Validasyon hatalarını kullanıcıya döndür
            var errorList = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return Json(new { success = false, message = string.Join(" | ", errorList) });
        }

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

        private async Task PopulateSelectListsAsync(Product p = null)
        {
            try
            {
                // Fetch all dropdown data in parallel with AsNoTracking for performance
                var countriesTask = _context.Countries?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<Country>());
                var categoriesTask = _context.ProductCategories?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<ProductCategory>());
                var definitionsTask = _context.ProductDefinitions?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<ProductDefinition>());
                var suppliersTask = _context.Suppliers?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<Supplier>());
                var unitsTask = _context.Units?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<Unit>());
                var warehousesTask = _context.WareHouses?.AsNoTracking().OrderBy(x => x.Name).ToListAsync() ?? Task.FromResult(new List<WareHouse>());

                // Wait for all tasks to complete in parallel
                await Task.WhenAll(countriesTask, categoriesTask, definitionsTask, suppliersTask, unitsTask, warehousesTask);

                // Get results
                var countries = await countriesTask;
                var categories = await categoriesTask;
                var definitions = await definitionsTask;
                var suppliers = await suppliersTask;
                var units = await unitsTask;
                var warehouses = await warehousesTask;

                ViewBag.CountryId = new SelectList(countries, "Id", "Name", p?.CountryId);
                ViewBag.ProductCategoryId = new SelectList(categories, "Id", "Name", p?.ProductCategoryId);
                ViewBag.ProductDefinitionId = new SelectList(definitions, "Id", "Name", p?.ProductDefinitionId);
                ViewBag.SupplierId = new SelectList(suppliers, "Id", "Name", p?.SupplierId);
                ViewBag.UnitId = new SelectList(units, "Id", "Name", p?.UnitId);
                ViewBag.WarehouseId = new SelectList(warehouses, "Id", "Name", p?.WarehouseId);
            }
            catch (Exception ex)
            {
                // Veritabanı hatasında log tut ve boş listeler gönder
                Console.WriteLine($"PopulateSelectListsAsync Error: {ex.Message}");
                
                ViewBag.CountryId = new SelectList(Enumerable.Empty<Country>(), "Id", "Name");
                ViewBag.ProductCategoryId = new SelectList(Enumerable.Empty<ProductCategory>(), "Id", "Name");
                ViewBag.ProductDefinitionId = new SelectList(Enumerable.Empty<ProductDefinition>(), "Id", "Name");
                ViewBag.SupplierId = new SelectList(Enumerable.Empty<Supplier>(), "Id", "Name");
                ViewBag.UnitId = new SelectList(Enumerable.Empty<Unit>(), "Id", "Name");
                ViewBag.WarehouseId = new SelectList(Enumerable.Empty<WareHouse>(), "Id", "Name");
            }
        }

        private void PopulateSelectLists(Product p = null)
        {
            try
            {
                // Veritabanı bağlantısını kontrol Et - Keep for backward compatibility
                var countries = _context.Countries?.OrderBy(x => x.Name)?.ToList() ?? new List<Country>();
                var categories = _context.ProductCategories?.OrderBy(x => x.Name)?.ToList() ?? new List<ProductCategory>();
                var definitions = _context.ProductDefinitions?.OrderBy(x => x.Name)?.ToList() ?? new List<ProductDefinition>();
                var suppliers = _context.Suppliers?.OrderBy(x => x.Name)?.ToList() ?? new List<Supplier>();
                var units = _context.Units?.OrderBy(x => x.Name)?.ToList() ?? new List<Unit>();
                var warehouses = _context.WareHouses?.OrderBy(x => x.Name)?.ToList() ?? new List<WareHouse>();

                ViewBag.CountryId = new SelectList(countries, "Id", "Name", p?.CountryId);
                ViewBag.ProductCategoryId = new SelectList(categories, "Id", "Name", p?.ProductCategoryId);
                ViewBag.ProductDefinitionId = new SelectList(definitions, "Id", "Name", p?.ProductDefinitionId);
                ViewBag.SupplierId = new SelectList(suppliers, "Id", "Name", p?.SupplierId);
                ViewBag.UnitId = new SelectList(units, "Id", "Name", p?.UnitId);
                ViewBag.WarehouseId = new SelectList(warehouses, "Id", "Name", p?.WarehouseId);
            }
            catch (Exception ex)
            {
                // Veritabanı hatasında log tut ve boş listeler gönder
                Console.WriteLine($"PopulateSelectLists Error: {ex.Message}");
                
                ViewBag.CountryId = new SelectList(Enumerable.Empty<Country>(), "Id", "Name");
                ViewBag.ProductCategoryId = new SelectList(Enumerable.Empty<ProductCategory>(), "Id", "Name");
                ViewBag.ProductDefinitionId = new SelectList(Enumerable.Empty<ProductDefinition>(), "Id", "Name");
                ViewBag.SupplierId = new SelectList(Enumerable.Empty<Supplier>(), "Id", "Name");
                ViewBag.UnitId = new SelectList(Enumerable.Empty<Unit>(), "Id", "Name");
                ViewBag.WarehouseId = new SelectList(Enumerable.Empty<WareHouse>(), "Id", "Name");
            }
        }
    }
}