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
        public IActionResult Create()
        {
            PopulateSelectLists();

            // AJAX çağrısı ise sadece Formu (Partial), normal çağrı ise Create.cshtml'i (View) dön
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                return PartialView("_ProductFormPartial", new Product());

            return View(new Product());
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

        private void PopulateSelectLists(Product p = null)
        {
            ViewBag.CountryId = new SelectList(_context.Countries.OrderBy(x => x.Name), "Id", "Name", p?.CountryId);
            ViewBag.ProductCategoryId = new SelectList(_context.ProductCategories.OrderBy(x => x.Name), "Id", "Name", p?.ProductCategoryId);
            ViewBag.ProductDefinitionId = new SelectList(_context.ProductDefinitions.OrderBy(x => x.Name), "Id", "Name", p?.ProductDefinitionId);
            ViewBag.SupplierId = new SelectList(_context.Suppliers.OrderBy(x => x.Name), "Id", "Name", p?.SupplierId);
            ViewBag.UnitId = new SelectList(_context.Units.OrderBy(x => x.Name), "Id", "Name", p?.UnitId);
            ViewBag.WarehouseId = new SelectList(_context.WareHouses.OrderBy(x => x.Name), "Id", "Name", p?.WarehouseId);
        }
    }
}