using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers;

public class ReportsController : Controller
{
    private readonly WineSpiritsContext _context;

    public ReportsController(WineSpiritsContext context)
    {
        _context = context;
    }

    // GET: /Reports
    public async Task<IActionResult> Index(
        string? search      = null,
        string? dateRange   = null,
        string? reportType  = null)
    {
        // ── Temel sorgu ──────────────────────────────────────────────────────
        var query = _context.OrderDetails
            .Include(od => od.Order)
                .ThenInclude(o => o!.Customer)
            .Include(od => od.Product)
                .ThenInclude(p => p!.ProductDefinition)
            .AsQueryable();

        // ── Tarih aralığı filtresi ────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(dateRange))
        {
            var parts = dateRange.Split(" to ");
            if (parts.Length == 2
                && DateTime.TryParseExact(parts[0].Trim(), "dd.MM.yyyy", null,
                    System.Globalization.DateTimeStyles.None, out var from)
                && DateTime.TryParseExact(parts[1].Trim(), "dd.MM.yyyy", null,
                    System.Globalization.DateTimeStyles.None, out var to))
            {
                query = query.Where(od =>
                    od.Order!.CreatedDate >= from &&
                    od.Order.CreatedDate <= to.AddDays(1));
            }
        }

        // ── Metin arama filtresi ──────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(od =>
                ((od.Order!.Customer!.Name ?? "") + " " + (od.Order.Customer.Lastname ?? "")).ToLower().Contains(s) ||
                (od.Product!.ProductDefinition!.Name ?? "").ToLower().Contains(s));
        }

        // ── Son 6 aylık ciro (istatistik kartları) ────────────────────────────
        var sixMonthsAgo = DateTime.Today.AddMonths(-6);
        var allOrders = await _context.OrderDetails
            .Include(od => od.Order)
            .Where(od => od.Order!.CreatedDate >= sixMonthsAgo)
            .ToListAsync();

        var totalRevenue = allOrders.Sum(od => od.TotalPrice);
        var avgOrder     = allOrders.Any()
            ? allOrders.GroupBy(od => od.OrderId).Average(g => g.Sum(r => r.TotalPrice))
            : 0m;
        var totalUnits   = allOrders.Sum(od => od.Quantity);

        // ── ViewModel ─────────────────────────────────────────────────────────
        var vm = new ReportsIndexViewModel
        {
            TotalRevenue            = totalRevenue,
            RevenueChangePercent    = 12.5,
            AvgOrderValue           = avgOrder,
            AvgOrderChangePercent   = 8.2,
            TotalUnitsSold          = totalUnits,
            UnitsSoldChangePercent  = 15.3,
            CustomerSatisfaction    = 4.8,
            SatisfactionChangePercent = 0.3,

            FilterSearch    = search,
            FilterDateRange = dateRange,
            FilterReportType= reportType,
        };

        return View(vm);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET: /Reports/GetDashboardData
    // Tüm dashboard grafikleri için JSON verisi döner.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetDashboardData(DateTime? startDate, DateTime? endDate)
    {
        var now          = DateTime.Today;
        var sixMonthsAgo = now.AddMonths(-5).AddDays(-(now.Day - 1)); // ilk ayın 1'i
        
        var from = startDate ?? sixMonthsAgo;
        var to = endDate ?? now;

        // ── Tüm gerekli verileri tek sorguda çek ─────────────────────────────
        var rawData = await _context.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Product)
                .ThenInclude(p => p.ProductCategory)
            .Include(od => od.Product)
                .ThenInclude(p => p.ProductDefinition)
            .Include(od => od.Order)
                .ThenInclude(o => o!.Customer)
            .Where(od => od.Order!.CreatedDate >= from && od.Order.CreatedDate <= to.AddDays(1))
            .ToListAsync();

        // ── 1. KATEGORİ BAZLI AYLIK SATIŞLAR ─────────────────────────────────
        // Türkçe ay kısaltmaları
        var monthLabels = new[] { "Oca", "Şub", "Mar", "Nis", "May", "Haz",
                                  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" };

        // Dinamik ay etiketleri
        var months = new List<DateTime>();
        var currentMonth = new DateTime(from.Year, from.Month, 1);
        var endMonth = new DateTime(to.Year, to.Month, 1);
        while (currentMonth <= endMonth)
        {
            months.Add(currentMonth);
            currentMonth = currentMonth.AddMonths(1);
        }

        var labels = months.Select(m => monthLabels[m.Month - 1] + (m.Year != now.Year ? " '" + m.Year.ToString().Substring(2) : "")).ToList();

        // Kategori listesi (DB'deki gerçek isimler)
        var categoryNames = new[] { "Kırmızı Şarap", "Beyaz Şarap", "Rosé", "Şampanya" };
        var categoryColors = new[]
        {
            new { border = "#c0392b", bg = "rgba(192,57,43,0.85)" },  // Kırmızı Şarap
            new { border = "#d4a017", bg = "rgba(212,160,23,0.85)" }, // Beyaz Şarap
            new { border = "#e91e8c", bg = "rgba(233,30,140,0.85)" }, // Rosé
            new { border = "#7c3aed", bg = "rgba(124,58,237,0.85)" }  // Şampanya
        };

        var categorySalesDatasets = categoryNames.Select((catName, idx) =>
        {
            var monthlyData = months.Select(m =>
            {
                return rawData
                    .Where(od =>
                        od.Order!.CreatedDate.Year  == m.Year &&
                        od.Order.CreatedDate.Month == m.Month &&
                        (od.Product?.ProductCategory?.Name ?? "") == catName)
                    .Sum(od => (double)od.TotalPrice);
            }).ToList();

            return new
            {
                label           = catName,
                data            = monthlyData,
                backgroundColor = categoryColors[idx].bg,
                borderColor     = categoryColors[idx].border,
                borderWidth     = 1,
                borderRadius    = 6
            };
        }).ToList();

        // ── 2. GELİR TRENDİ (Kırmızı & Beyaz Şarap, çizgi grafik) ──────────
        var trendDatasets = new[]
        {
            new { label = "Kırmızı Şarap", catName = "Kırmızı Şarap",
                  borderColor = "#c0392b", pointBg = "#c0392b",
                  tension = 0.4 },
            new { label = "Beyaz Şarap",   catName = "Beyaz Şarap",
                  borderColor = "#d4a017", pointBg = "#d4a017",
                  tension = 0.4 }
        }.Select(t =>
        {
            var monthlyData = months.Select(m =>
                rawData
                    .Where(od =>
                        od.Order!.CreatedDate.Year  == m.Year &&
                        od.Order.CreatedDate.Month == m.Month &&
                        (od.Product?.ProductCategory?.Name ?? "") == t.catName)
                    .Sum(od => (double)od.TotalPrice)
            ).ToList();

            return new
            {
                label       = t.label,
                data        = monthlyData,
                borderColor = t.borderColor,
                pointBackgroundColor = t.pointBg,
                pointRadius = 5,
                pointHoverRadius = 7,
                tension     = t.tension,
                fill        = false,
                borderWidth = 2
            };
        }).ToList();

        // ── 3. EN ÇOK SATAN ÜRÜNLER (Top 5) ─────────────────────────────────
        var topProducts = rawData
            .GroupBy(od => new
            {
                Name = od.Product?.ProductDefinition?.Name ?? "Tanımsız"
            })
            .Select(g => new
            {
                name         = g.Key.Name,
                totalQty     = g.Sum(x => x.Quantity),
                totalRevenue = (double)g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.totalQty)
            .Take(5)
            .ToList();

        // ── 4. EN DEĞERLİ MÜŞTERİLER (Top 5) ────────────────────────────────
        var topCustomers = rawData
            .Where(od => od.Order?.Customer != null)
            .GroupBy(od => new
            {
                Name = (od.Order!.Customer!.Name + " " + od.Order.Customer.Lastname).Trim()
            })
            .Select(g => new
            {
                name         = g.Key.Name,
                orderCount   = g.Select(x => x.OrderId).Distinct().Count(),
                totalRevenue = (double)g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.totalRevenue)
            .Take(5)
            .ToList();

        return Json(new
        {
            labels,
            categorySales = new { datasets = categorySalesDatasets },
            revenueTrend  = new { datasets = trendDatasets },
            topProducts,
            topCustomers
        });
    }

    // POST (AJAX): /Reports/Filter
    [HttpGet]
    public async Task<IActionResult> Filter(
        string? search    = null,
        string? dateRange = null,
        string? type      = null)
    {
        return RedirectToAction(nameof(Index), new { search, dateRange, reportType = type });
    }
}
