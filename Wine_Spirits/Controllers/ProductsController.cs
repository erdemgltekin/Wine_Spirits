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
            if (ModelState.IsValid)
            {
                try
                {
                    product.Id = Guid.NewGuid();
                    _context.Add(product);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Veritabanı hatası: " + ex.Message });
                }
            }

            // Hangi alanın hata verdiğini bulup JS'e gönderiyoruz
            var errorMessages = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return Json(new
            {
                success = false,
                message = "Lütfen alanları kontrol edin: " + string.Join(", ", errorMessages)
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetProductsData(DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.ProductDefinition).Include(p => p.ProductCategory)
                    .Include(p => p.Unit).Include(p => p.Supplier).Include(p => p.Country)
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
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        private void PopulateSelectLists(Product p = null)
        {
            ViewData["CountryId"] = new SelectList(_context.Countries, "Id", "Name", p?.CountryId);
            ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategories, "Id", "Name", p?.ProductCategoryId);
            ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinitions, "Id", "Name", p?.ProductDefinitionId);
            ViewData["SupplierId"] = new SelectList(_context.Suppliers, "Id", "Name", p?.SupplierId);
            ViewData["UnitId"] = new SelectList(_context.Units, "Id", "Name", p?.UnitId);
        }
    }
}