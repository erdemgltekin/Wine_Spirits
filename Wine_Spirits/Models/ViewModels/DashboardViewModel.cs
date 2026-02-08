using Wine_Spirits.Models;

namespace Wine_Spirits.Models.ViewModels;

public class DashboardViewModel
{
    public int TotalProducts { get; set; }
    public int CriticalStockCount { get; set; }
    public int TotalCountries { get; set; }
    public int TotalSuppliers { get; set; }
    public decimal MonthlySales { get; set; }
    public List<Product> RecentProducts { get; set; } = new List<Product>();
}
