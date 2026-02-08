using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers;

public class HomeController : Controller
{
    private readonly WineSpiritsContext _context;

    public HomeController(WineSpiritsContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        // [Dashboard Data Fetching]
        // Veritabanından canlı istatistikleri çekiyoruz.
        
        var viewModel = new DashboardViewModel
        {
            TotalProducts = await _context.Products.CountAsync(),
            
            // Kritik Stok: 10 adetten az kalan ürünler
            CriticalStockCount = await _context.Products.CountAsync(p => p.StockQuantity < 10),
            
            TotalCountries = await _context.Countries.CountAsync(),
            TotalSuppliers = await _context.Suppliers.CountAsync(),

            // Aylık Satış (Bu Ay): OrderDetails tablosundan bu ayki siparişlerin toplam tutarı
            MonthlySales = await _context.OrderDetails
                .Include(od => od.Order)
                .Where(od => od.Order.OrderDate.Month == DateTime.Now.Month && od.Order.OrderDate.Year == DateTime.Now.Year)
                .SumAsync(od => od.TotalPrice),
            
            // Son eklenen 5 ürünü getir ( İlişkili verilerle birlikte )
            RecentProducts = await _context.Products
                .Include(p => p.Unit)
                .Include(p => p.ProductCategory)
                .OrderByDescending(p => p.Id) // Son eklenenler (Varsayım: ID artarak gidiyor veya CreatedAt yoksa ID kullanılır)
                .Take(5)
                .ToListAsync()
        };

        return View(viewModel);
    }

    public IActionResult Privacy()
    {
        return View();
    }
}
