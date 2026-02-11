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
            // Range filtering
            DateTime? startDate = range switch
            {
                "today" => DateTime.Today,
                "week"  => DateTime.Today.AddDays(-7),
                "month" => new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1),
                "year"  => new DateTime(DateTime.Now.Year, 1, 1),
                _       => null
            };

            // Global Stats (Not range filtered usually)
            var totalProducts = await _context.Product.CountAsync();
            var totalStock = await _context.Product.SumAsync(p => (int?)p.StockQuantity) ?? 0;

            // Range Filtered Queries
            IQueryable<OrderDetail> orderQuery = _context.OrderDetail.Include(od => od.Order);
            if (startDate.HasValue)
            {
                orderQuery = orderQuery.Where(od => od.Order.OrderDate >= startDate.Value);
            }

            var totalCiro = await orderQuery.SumAsync(od => (decimal?)od.TotalPrice) ?? 0m;

            // Dynamic Category Analysis (GroupBy Category)
            // Tüm kategorileri çekiyoruz ve her kategorideki ürün sayısını alıyoruz.
            // Bu sayede 0 ürünü olan kategoriler de grafikte görülebilir (opsiyonel) 
            // veya sadece ürün içeren kategoriler daha sağlıklı listelenir.
            var categories = await _context.ProductCategory.ToListAsync();
            var products = await _context.Product.ToListAsync();

            var categoryStats = categories.Select(c => new
            {
                Name = c.Name,
                Count = products.Count(p => p.ProductCategoryId == c.Id)
            })
            .Where(x => x.Count > 0) // Sadece içinde ürün olanları gösterelim (isteğe bağlı)
            .ToList();

            var catLabels = categoryStats.Select(s => s.Name).ToArray();
            var catValues = categoryStats.Select(s => s.Count).ToArray();

            // Recent Orders (Last 5)
            var recentOrders = await _context.OrderDetail
                .Include(od => od.Order).ThenInclude(o => o.Customer)
                .Include(od => od.Product).ThenInclude(p => p.ProductDefinition)
                .OrderByDescending(od => od.Order.OrderDate)
                .Take(5)
                .Select(od => new
                {
                    Id = od.Order.Id.ToString().Substring(0, 8).ToUpper(),
                    CustomerName = od.Order.Customer.Name + " " + od.Order.Customer.Lastname,
                    ProductName = od.Product.ProductDefinition != null ? od.Product.ProductDefinition.Name : "Ürün",
                    Quantity = od.Quantity,
                    Status = "Tamamlandı",
                    Total = od.TotalPrice
                })
                .ToListAsync();

            // Static Chart Data for now (can be dynamic later)
            var monthLabels = new[] { "Eyl", "Eki", "Kas", "Ara", "Oca", "Şub" };
            var monthValues = new decimal[] { 12000, 19000, 15000, 25000, 22000, 30000 };

            var result = new
            {
                TotalProducts = totalProducts,
                TotalStock = totalStock,
                MonthlySales = totalCiro,
                TotalCiro = totalCiro,
                RecentOrders = recentOrders,
                Months = monthLabels,
                SalesData = monthValues,
                CategoryLabels = catLabels,
                CategoryValues = catValues,
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