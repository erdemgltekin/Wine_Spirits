using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.Orders;

public class OrderModel : PageModel
{
    private readonly ILogger<OrderModel> _logger;
    public OrderModel(ILogger<OrderModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
