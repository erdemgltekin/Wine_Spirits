using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers;

public class DashboardController : Controller
{
    private readonly WineSpiritsContext _context;

    public DashboardController(WineSpiritsContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        // [Dashboard Veri Çekme - V4 Nihai]
        var totalProducts = await _context.Product.CountAsync();
        var totalStock = await _context.Product.SumAsync(p => p.StockQuantity);
        var pendingApprovals = await _context.SupportRequest.CountAsync(r => r.Status == 0);
        
        // Gerçek Toplam Sipariş Tutarı (Ciro)
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

        // Kritik Stok Ürünleri
        var criticalStockProducts = await _context.Product
            .Include(p => p.ProductDefinition)
            .Include(p => p.Unit)
            .Where(p => p.StockQuantity < 10)
            .OrderBy(p => p.StockQuantity)
            .Take(5)
            .ToListAsync();

        // [Premium Analitik: Aylık Performans]
        var sixMonthsAgo = DateTime.Now.AddMonths(-5);
        var monthlyData = await _context.OrderDetail
            .Include(od => od.Order)
            .Where(od => od.Order.OrderDate >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyLabels = new List<string>();
        var monthlySales = new List<decimal>();
        var monthlyProfit = new List<decimal>();

        // Türkçe Yerelleştirme için CultureInfo
        var trCulture = new System.Globalization.CultureInfo("tr-TR");

        for (int i = 5; i >= 0; i--)
        {
            var date = DateTime.Now.AddMonths(-i);
            monthlyLabels.Add(date.ToString("MMMM", trCulture)); // Tam ay adı: Ocak, Şubat...

            var monthItems = monthlyData.Where(d => d.Order.OrderDate.Month == date.Month && d.Order.OrderDate.Year == date.Year);
            var sales = monthItems.Sum(d => d.TotalPrice);
            monthlySales.Add(sales);
            monthlyProfit.Add(sales * 0.22m);
        }

        // [Stok Trendi: Son 10 Gün]
        var tenDaysAgo = DateTime.Now.AddDays(-9);
        var movements = await _context.StockMovement
            .Where(sm => sm.Date >= tenDaysAgo.Date)
            .ToListAsync();

        var stockTrendLabels = new List<string>();
        var stockTrendValues = new List<int>();

        for (int i = 9; i >= 0; i--)
        {
            var date = DateTime.Now.AddDays(-i).Date;
            stockTrendLabels.Add(date.ToString("dd MMM", trCulture)); // Örn: 11 Şub

            var dayMovements = movements.Where(m => m.Date.Date == date);
            var netChange = dayMovements.Sum(m => m.MovementType == "Giriş" ? m.Quantity : -m.Quantity);
            stockTrendValues.Add(netChange);
        }

        // [Son Siparişler - V4 Şov Başlasın]
        var recentOrderItems = await _context.OrderDetail
            .Include(od => od.Order)
                .ThenInclude(o => o.Customer)
            .Include(od => od.Product)
                .ThenInclude(p => p.ProductDefinition)
            .OrderByDescending(od => od.Order.OrderDate)
            .Take(8)
            .ToListAsync();

        // [Kategori Renkleri]
        var categoryColors = new Dictionary<string, string>
        {
            { "Kırmızı", "#8B0000" }, { "Beyaz", "#F0E68C" }, { "Roze", "#FFB6C1" },
            { "Viski", "#DAA520" }, { "Votka", "#F8F8FF" }, { "Cin", "#B0E0E6" }
        };

        var viewModel = new DashboardViewModel
        {
            TotalProducts = totalProducts,
            TotalStock = totalStock,
            PendingApprovals = pendingApprovals,
            TotalInventoryValue = totalOrdersValue, // Global Ciro olarak gösterelim

            CategoryLabels = categoryData.Select(x => x.Label).ToList(),
            CategoryValues = categoryData.Select(x => x.Value).ToList(),
            CountryLabels = countryData.Select(x => x.Label).ToList(),
            CountryValues = countryData.Select(x => x.Value).ToList(),

            CriticalStockProducts = criticalStockProducts,
            RecentOrderItems = recentOrderItems,
            
            MonthlyLabels = monthlyLabels,
            MonthlySales = monthlySales,
            MonthlyProfit = monthlyProfit,
            StockTrendLabels = stockTrendLabels,
            StockTrendValues = stockTrendValues,
            CategoryColors = categoryColors,
            Trends = new Dictionary<string, double> { { "Sales", 12.5 }, { "Stock", -2.1 } }
        };

        return View(viewModel);
    }

    public IActionResult Privacy()
    {
        return View();
    }
}
