namespace Wine_Spirits.Models.ViewModels;

/// <summary>
/// Raporlar sayfası için ana ViewModel.
/// Tüm tarih alanları CreatedDate kullanılarak tutarlı hâle getirildi.
/// </summary>
public class ReportsIndexViewModel
{
    // --------------------------------------------------
    // 1. İSTATİSTİK KARTLARI (4'lü üst grid)
    // --------------------------------------------------

    /// <summary>Son 6 aylık toplam gelir (₺)</summary>
    public decimal TotalRevenue { get; set; }

    /// <summary>Önceki döneme göre gelir değişim yüzdesi (+/-)</summary>
    public double RevenueChangePercent { get; set; }

    /// <summary>Ortalama sipariş değeri (₺)</summary>
    public decimal AvgOrderValue { get; set; }

    /// <summary>Önceki döneme göre ortalama sipariş değişimi</summary>
    public double AvgOrderChangePercent { get; set; }

    /// <summary>Toplam ürün satış adedi</summary>
    public int TotalUnitsSold { get; set; }

    /// <summary>Birim satış değişim yüzdesi</summary>
    public double UnitsSoldChangePercent { get; set; }

    /// <summary>Müşteri memnuniyet puanı (örn: 4.8)</summary>
    public double CustomerSatisfaction { get; set; }

    /// <summary>Memnuniyet değişimi</summary>
    public double SatisfactionChangePercent { get; set; }

    // --------------------------------------------------
    // 2. SATIR RAPORU — Sipariş Geçmişi
    // --------------------------------------------------
    public List<ReportOrderRow> RecentOrders { get; set; } = new();

    // --------------------------------------------------
    // 3. FİLTRE DEĞERLERİ (sayfa yükleme anında form için)
    // --------------------------------------------------
    public string? FilterSearch      { get; set; }
    public string? FilterDateRange   { get; set; }
    public string? FilterReportType  { get; set; }
}

/// <summary>Rapor tablosundaki tek bir sipariş satırı</summary>
public class ReportOrderRow
{
    public string  OrderId       { get; set; } = string.Empty;
    public string  CustomerName  { get; set; } = string.Empty;
    public string  ProductName   { get; set; } = string.Empty;
    public int     Quantity      { get; set; }
    public decimal UnitPrice     { get; set; }
    public decimal TotalPrice    { get; set; }

    /// <summary>BaseEntity.CreatedDate kullanılıyor (CreatedAt değil)</summary>
    public DateTime? CreatedDate { get; set; }

    public string  Status        { get; set; } = "Tamamlandı";
}
