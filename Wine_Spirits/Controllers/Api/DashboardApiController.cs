using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers.Api;

[Route("api/dashboard")]
[ApiController]
public class DashboardApiController : ControllerBase
{
    private readonly WineSpiritsContext _context;

    public DashboardApiController(WineSpiritsContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalProducts = await _context.Product.CountAsync();
        var totalStock = await _context.Product.SumAsync(p => p.StockQuantity);
        var pendingApprovals = await _context.SupportRequest.CountAsync(r => r.Status == 0);
        var totalOrdersValue = await _context.OrderDetail.SumAsync(od => od.TotalPrice);

        // Kategori Bazlı Dağılım
        var categoryData = await _context.Product
            .Include(p => p.ProductCategory)
            .GroupBy(p => p.ProductCategory.Name ?? "Diğer")
            .Select(g => new { Label = g.Key, Value = g.Count() })
            .ToListAsync();

        // Ülke Bazlı Dağılım
        var countryData = await _context.Product
            .Include(p => p.Country)
            .GroupBy(p => p.Country.Name ?? "Bilinmiyor")
            .Select(g => new { Label = g.Key, Value = g.Count() })
            .ToListAsync();

        // Premium Analitik: Aylık Performans
        var sixMonthsAgo = DateTime.Now.AddMonths(-5);
        var monthlyData = await _context.OrderDetail
            .Include(od => od.Order)
            .Where(od => od.Order.OrderDate >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyLabels = new List<string>();
        var monthlySales = new List<decimal>();
        var monthlyProfit = new List<decimal>();
        var trCulture = new System.Globalization.CultureInfo("tr-TR");

        for (int i = 5; i >= 0; i--)
        {
            var date = DateTime.Now.AddMonths(-i);
            monthlyLabels.Add(date.ToString("MMMM", trCulture));
            var monthItems = monthlyData.Where(d => d.Order.OrderDate.Month == date.Month && d.Order.OrderDate.Year == date.Year);
            var sales = monthItems.Sum(d => d.TotalPrice);
            monthlySales.Add(sales);
            monthlyProfit.Add(sales * 0.22m);
        }

        // Stok Trendi: Son 10 Gün
        var tenDaysAgo = DateTime.Now.AddDays(-9);
        var movements = await _context.StockMovement
            .Where(sm => sm.Date >= tenDaysAgo.Date)
            .ToListAsync();

        var stockTrendLabels = new List<string>();
        var stockTrendValues = new List<int>();

        for (int i = 9; i >= 0; i--)
        {
            var date = DateTime.Now.AddDays(-i).Date;
            stockTrendLabels.Add(date.ToString("dd MMM", trCulture));
            var dayMovements = movements.Where(m => m.Date.Date == date);
            var netChange = dayMovements.Sum(m => m.MovementType == "Giriş" ? m.Quantity : -m.Quantity);
            stockTrendValues.Add(netChange);
        }

        // Son Siparişler (DTO projeksiyonu ile dairesel referansları engelliyoruz)
        var recentOrders = await _context.OrderDetail
            .Include(od => od.Order)
                .ThenInclude(o => o.Customer)
            .Include(od => od.Product)
                .ThenInclude(p => p.ProductDefinition)
            .OrderByDescending(od => od.Order.OrderDate)
            .Take(8)
            .Select(od => new {
                OrderId = od.OrderId,
                OrderShortId = od.Order.Id.ToString().Substring(0, 8).ToUpper(),
                CustomerName = od.Order.Customer.Name + " " + od.Order.Customer.Lastname,
                CustomerEmail = od.Order.Customer.Email,
                CustomerInitials = od.Order.Customer.Name.Substring(0,1) + od.Order.Customer.Lastname.Substring(0,1),
                ProductName = od.Product.ProductDefinition.Name,
                Quantity = od.Quantity,
                UnitName = od.Product.Unit.Name,
                TotalPrice = od.TotalPrice,
                StatusValue = od.Order.Id.GetHashCode() % 4 // Simülasyon
            })
            .ToListAsync();

        return Ok(new {
            totalProducts,
            totalStock,
            pendingApprovals,
            totalInventoryValue = totalOrdersValue,
            categoryLabels = categoryData.Select(x => x.Label),
            categoryValues = categoryData.Select(x => x.Value),
            countryLabels = countryData.Select(x => x.Label),
            countryValues = countryData.Select(x => x.Value),
            monthlyLabels,
            monthlySales,
            monthlyProfit,
            stockTrendLabels,
            stockTrendValues,
            recentOrders,
            trends = new { sales = 12.5, stock = -2.1 }
        });
    }
}
