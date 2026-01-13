using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.Warehouses;

public class WarehouseModel : PageModel
{
    private readonly ILogger<WarehouseModel> _logger;
    public WarehouseModel(ILogger<WarehouseModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
