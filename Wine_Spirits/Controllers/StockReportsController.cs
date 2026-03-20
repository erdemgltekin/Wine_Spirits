using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models; // Context ve Modellerin bulunduğu yer

namespace Wine_Spirits.Controllers
{
    public class StockReportsController : Controller
    {
        private readonly WineSpiritsContext _context;

        // Constructor: Gerçek Context ismini (WineSpiritsContext) kullanıyoruz
        public StockReportsController(WineSpiritsContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetReportData()
        {
            try
            {
                // StockMovement üzerinden verileri ve ilişkili tabloları çekiyoruz
                var stocks = await _context.StockMovements
                    .Include(s => s.Product)
                        .ThenInclude(p => p.ProductDefinition)
                    .Include(s => s.Product)
                        .ThenInclude(p => p.ProductCategory)
                    // Eğer StockMovement tablonuzda WareHouseId varsa burayı aktif edin
                    // .Include(s => s.WareHouse) 
                    .Select(item => new {
                        productName = item.Product.ProductDefinition.Name,
                        productCode = item.Product.Id.ToString().Substring(0, 8), // GUID'den kısa kod
                        categoryName = item.Product.ProductCategory.Name ?? "Genel",
                        warehouseName = "Ana Depo", // İlişki yoksa statik, varsa item.WareHouse.Name
                        stockQuantity = item.Quantity,
                        unit = "Adet",
                        unitPrice = item.Product.Price,
                        totalValue = item.Quantity * item.Product.Price,
                        criticalLevel = 10 // Sabit veya modeldeki bir alandan
                    })
                    .ToListAsync();

                return Json(new { data = stocks });
            }
            catch (Exception ex)
            {
                // Hata durumunda konsola yazdır ve mesaj dön
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}