using Wine_Spirits.Models;

namespace Wine_Spirits.Models.ViewModels;

public class ProductsIndexViewModel
{
    // View'da listeleme için orijinal Product listesi
    public IEnumerable<Product> Products { get; set; } = new List<Product>();
    
    // AJAX veya diğer süreçler için esnek veri yapısını koruyoruz
    public IEnumerable<object>? ProductsData { get; set; }

    public ProductStats Stats { get; set; } = new ProductStats();
}

public class ProductStats
{
    public int TotalProducts { get; set; }
    public int CriticalStockCount { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int CategoryCount { get; set; }
}
