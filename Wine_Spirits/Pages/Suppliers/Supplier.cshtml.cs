using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.Suppliers;

public class SupplierModel : PageModel
{
    private readonly ILogger<SupplierModel> _logger;
    public SupplierModel(ILogger<SupplierModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
