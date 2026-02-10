using Wine_Spirits.Models;

namespace Wine_Spirits.Models.ViewModels;

public class DashboardViewModel
{
    // Widget Kartları için veriler
    public int TotalProducts { get; set; }
    public int TotalStock { get; set; }
    public int PendingApprovals { get; set; }
    public decimal TotalInventoryValue { get; set; }

    // Grafik verileri (Kategori Dağılımı)
    public List<string> CategoryLabels { get; set; } = new();
    public List<int> CategoryValues { get; set; } = new();

    // Grafik verileri (Ülke Dağılımı)
    public List<string> CountryLabels { get; set; } = new();
    public List<int> CountryValues { get; set; } = new();

    // Kritik Stok Ürünleri
    public List<Product> CriticalStockProducts { get; set; } = new();

    // Bekleyen Onay Talepleri (Detaylı liste için)
    public List<SupportRequest> PendingSupportRequests { get; set; } = new();

    // Aylık Performans Verileri (Premium Grafikler için)
    public List<string> MonthlyLabels { get; set; } = new();
    public List<decimal> MonthlySales { get; set; } = new();
    public List<decimal> MonthlyProfit { get; set; } = new();

    // Trend Analizleri (Figma Widget'lar için: % değişim)
    public Dictionary<string, double> Trends { get; set; } = new();

    // Kategori Renk Paleti (JS'e aktarılacak)
    public Dictionary<string, string> CategoryColors { get; set; } = new();

    // Mevcut listeler
    public List<Product> RecentProducts { get; set; } = new List<Product>();
    public List<OrderDetail> RecentOrderItems { get; set; } = new List<OrderDetail>();

    // Stok Trend Verileri (Figma Premium V3)
    public List<string> StockTrendLabels { get; set; } = new();
    public List<int> StockTrendValues { get; set; } = new();
}
