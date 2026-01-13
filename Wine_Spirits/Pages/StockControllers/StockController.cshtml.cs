using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.StockControllers;

public class StockControllerModel : PageModel
{
    private readonly ILogger<StockControllerModel> _logger;
    public StockControllerModel(ILogger<StockControllerModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
