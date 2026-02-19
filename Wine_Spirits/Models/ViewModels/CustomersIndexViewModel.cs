using Wine_Spirits.Models;

namespace Wine_Spirits.Models.ViewModels;

public class CustomersIndexViewModel
{
    public List<Customer> Customers { get; set; } = new List<Customer>();
    public CustomerStats Stats { get; set; } = new CustomerStats();
}
