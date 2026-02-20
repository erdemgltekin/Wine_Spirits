using System.Collections.Generic;

namespace Wine_Spirits.Models.ViewModels
{
    public class SuppliersIndexViewModel
    {
        public IEnumerable<Supplier> Suppliers { get; set; } = new List<Supplier>();
        public SupplierStats Stats { get; set; } = new SupplierStats();
    }

    public class SupplierStats
    {
        public int TotalSuppliers { get; set; }
        public int ActiveSuppliers { get; set; }
        public int TotalProducts { get; set; }
        public string TotalPurchase { get; set; } = "₺0";
    }
}
