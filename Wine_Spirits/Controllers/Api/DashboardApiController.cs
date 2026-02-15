using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using System.Globalization;

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
        // Temel İstatistikler
        var totalProducts = await _context.Products.CountAsync();
        var totalStock = await _context.Products.SumAsync(p => (int?)p.StockQuantity) ?? 0;

        // [HATA DÜZELTİLDİ]: Status modelde string olduğu için "0" ile karşılaştırılmalı
        var pendingApprovals = await _context.SupportRequests.CountAsync(r => r.Status == "0");

        var totalOrdersValue = await _context.OrderDetails.SumAsync(od => (decimal?)od.TotalPrice) ?? 0m;

        // Kategori Bazlı Dağılım
        var categoryData = await _context.Products
            .Include(p => p.ProductCategory)
            .GroupBy(p => p.ProductCategory.Name ?? "Diğer")
            .Select(g => new { Label = g.Key, Value = g.Count() })
            .ToListAsync();

        // Ülke Bazlı Dağılım
        var countryData = await _context.Products
            .Include(p => p.Country)
            .GroupBy(p => p.Country.Name ?? "Bilinmiyor")
            .Select(g => new { Label = g.Key, Value = g.Count() })
            .ToListAsync();

        // Premium Analitik: Aylık Performans
        var sixMonthsAgo = DateTime.Now.AddMonths(-5);
        var monthlyData = await _context.OrderDetails
            .Include(od => od.Order)
            .Where(od => od.Order.OrderDate >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyLabels = new List<string>();
        var monthlySales = new List<decimal>();
        var monthlyProfit = new List<decimal>();
        var trCulture = new CultureInfo("tr-TR");

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
        var movements = await _context.StockMovements
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

        // Son Siparişler (Güvenli Substring ve Null Check eklendi)
        var recentOrders = await _context.OrderDetails
            .Include(od => od.Order).ThenInclude(o => o.Customer)
            .Include(od => od.Product).ThenInclude(p => p.ProductDefinition)
            .Include(od => od.Product).ThenInclude(p => p.Unit)
            .OrderByDescending(od => od.Order.OrderDate)
            .Take(8)
            .Select(od => new {
                OrderId = od.OrderId,
                // [GÜVENLİK]: Id null ise hata vermemesi için kontrol
                OrderShortId = od.Order != null ? od.Order.Id.ToString().Substring(0, 8).ToUpper() : "N/A",
                CustomerName = od.Order != null && od.Order.Customer != null ? od.Order.Customer.Name + " " + od.Order.Customer.Lastname : "Bilinmeyen",
                CustomerEmail = od.Order != null && od.Order.Customer != null ? od.Order.Customer.Email : "",
                // [GÜVENLİK]: İsimler boşsa Substring patlamasın diye kontrol
                CustomerInitials = od.Order != null && od.Order.Customer != null
                                   ? (od.Order.Customer.Name.Length > 0 ? od.Order.Customer.Name.Substring(0, 1) : "") +
                                     (od.Order.Customer.Lastname.Length > 0 ? od.Order.Customer.Lastname.Substring(0, 1) : "")
                                   : "??",
                ProductName = od.Product != null && od.Product.ProductDefinition != null ? od.Product.ProductDefinition.Name : "İsimsiz Ürün",
                Quantity = od.Quantity,
                UnitName = od.Product != null && od.Product.Unit != null ? od.Product.Unit.Name : "Adet",
                TotalPrice = od.TotalPrice,
                StatusValue = od.Order != null ? Math.Abs(od.Order.Id.GetHashCode() % 4) : 0
            })
            .ToListAsync();

        return Ok(new
        {
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