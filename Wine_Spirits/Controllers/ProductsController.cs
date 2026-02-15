using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers
{
    public class ProductsController : Controller
    {
        private readonly WineSpiritsContext _context;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public ProductsController(WineSpiritsContext context) => _context = context;

        public IActionResult Index() => View();

        public IActionResult Create()
        {
            PopulateSelectLists();
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product)
        {
            // İlişkisel nesne bağlarını validasyondan çıkarıyoruz (Hata vermemesi için)
            string[] navs = { "Country", "ProductCategory", "ProductDefinition", "Supplier", "Unit", "Warehouse" };
            foreach (var nav in navs) ModelState.Remove(nav);

            // KRİTİK KONTROL: UnitId boş mu geliyor?
            if (product.UnitId == Guid.Empty)
            {
                return Json(new { success = false, message = "Lütfen geçerli bir 'Birim' seçiniz. (Birim ID eksik)" });
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Eğer WarehouseId seçilmediyse varsayılanı ata
                    if (product.WarehouseId == Guid.Empty)
                    {
                        var defaultWh = await _context.WareHouses.FirstOrDefaultAsync();
                        if (defaultWh != null) product.WarehouseId = defaultWh.Id;
                    }

                    product.Id = Guid.NewGuid();
                    _context.Add(product);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true });
                }
                catch (DbUpdateException dbEx)
                {
                    // İşte senin görseldeki hatayı burada yakalayıp kullanıcıya açıklıyoruz
                    var msg = dbEx.InnerException?.Message ?? dbEx.Message;
                    if (msg.Contains("FK_Product_Unit"))
                        return Json(new { success = false, message = "Hata: Seçtiğiniz Birim sistemde bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin." });

                    return Json(new { success = false, message = "Veritabanı Hatası: " + msg });
                }
            }

            return Json(new { success = false, message = "Lütfen formdaki zorunlu alanları doldurun." });
        }

        [HttpGet]
        public async Task<IActionResult> GetProductsData(DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.ProductDefinition)
                    .Include(p => p.ProductCategory)
                    .Include(p => p.Unit)
                    .Include(p => p.Supplier)
                    .Include(p => p.Country)
                    .AsNoTracking();

                var products = await query.ToListAsync();
                var data = products.Select(p => new
                {
                    id = p.Id,
                    productCode = "WS-" + p.Id.ToString().Substring(0, 5).ToUpper(),
                    name = p.ProductDefinition?.Name ?? "İsimsiz",
                    categoryName = p.ProductCategory?.Name ?? "Genel",
                    price = p.Price,
                    stockQuantity = p.StockQuantity,
                    unitName = p.Unit?.Name ?? "Birim Yok",
                    supplierName = p.Supplier?.Name ?? "-",
                    countryName = p.Country?.Name ?? "-"
                }).ToList();

                var stats = new
                {
                    totalProducts = data.Count,
                    criticalStockCount = data.Count(d => d.stockQuantity < 10),
                    totalInventoryValue = data.Sum(d => d.price * (decimal)d.stockQuantity),
                    categoryCount = data.Select(d => d.categoryName).Distinct().Count()
                };

                return Json(new { products = data, stats = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Veri çekme hatası: " + ex.Message });
            }
        }

        private void PopulateSelectLists(Product p = null)
        {
            ViewData["CountryId"] = new SelectList(_context.Countries.OrderBy(x => x.Name), "Id", "Name", p?.CountryId);
            ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategories.OrderBy(x => x.Name), "Id", "Name", p?.ProductCategoryId);
            ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinitions.OrderBy(x => x.Name), "Id", "Name", p?.ProductDefinitionId);
            ViewData["SupplierId"] = new SelectList(_context.Suppliers.OrderBy(x => x.Name), "Id", "Name", p?.SupplierId);
            ViewData["UnitId"] = new SelectList(_context.Units.OrderBy(x => x.Name), "Id", "Name", p?.UnitId);
            ViewData["WarehouseId"] = new SelectList(_context.WareHouses.OrderBy(x => x.Name), "Id", "Name", p?.WarehouseId);
        }
    }
}