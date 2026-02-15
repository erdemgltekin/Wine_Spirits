using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

public class DashboardController : Controller
{
    private readonly WineSpiritsContext _context;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public DashboardController(WineSpiritsContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// Dashboard verileri — dinamik tarih aralığı filtresi
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboardData(string range = "all")
    {
        try
        {
            DateTime? startDate = range switch
            {
                "today" => DateTime.Today,
                "week" => DateTime.Today.AddDays(-7),
                "month" => new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1),
                "year" => new DateTime(DateTime.Now.Year, 1, 1),
                _ => null
            };

            var totalProducts = await _context.Products.CountAsync();
            // Nullable int cast ile Sum hatasını önledik
            var totalStock = await _context.Products.SumAsync(p => (int?)p.StockQuantity) ?? 0;

            IQueryable<OrderDetail> orderQuery = _context.OrderDetails.Include(od => od.Order);
            if (startDate.HasValue)
            {
                orderQuery = orderQuery.Where(od => od.Order.OrderDate >= startDate.Value);
            }

            var totalCiro = await orderQuery.SumAsync(od => (decimal?)od.TotalPrice) ?? 0m;

            var categories = await _context.ProductCategories.ToListAsync();
            var products = await _context.Products.ToListAsync();

            var categoryStats = categories.Select(c => new
            {
                Name = c.Name,
                Count = products.Count(p => p.ProductCategoryId == c.Id)
            })
            .Where(x => x.Count > 0)
            .ToList();

            // Recent Orders kısmındaki ID gösterimini güvenli hale getirdik
            var recentOrders = await _context.OrderDetails
                .Include(od => od.Order).ThenInclude(o => o.Customer)
                .Include(od => od.Product).ThenInclude(p => p.ProductDefinition)
                .OrderByDescending(od => od.Order.OrderDate)
                .Take(5)
                .Select(od => new
                {
                    Id = od.Order != null ? od.Order.Id.ToString().Substring(0, 8).ToUpper() : "N/A",
                    CustomerName = od.Order != null && od.Order.Customer != null
                                   ? od.Order.Customer.Name + " " + od.Order.Customer.Lastname
                                   : "Bilinmeyen Müşteri",
                    ProductName = od.Product != null && od.Product.ProductDefinition != null
                                  ? od.Product.ProductDefinition.Name
                                  : "Tanımsız Ürün",
                    Quantity = od.Quantity,
                    Status = "Tamamlandı",
                    Total = od.TotalPrice
                })
                .ToListAsync();

            var result = new
            {
                TotalProducts = totalProducts,
                TotalStock = totalStock,
                MonthlySales = totalCiro,
                TotalCiro = totalCiro,
                RecentOrders = recentOrders,
                CategoryLabels = categoryStats.Select(s => s.Name).ToArray(),
                CategoryValues = categoryStats.Select(s => s.Count).ToArray(),
                ServerTime = DateTime.Now.ToString("HH:mm")
            };

            return new JsonResult(result, _jsonOptions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}