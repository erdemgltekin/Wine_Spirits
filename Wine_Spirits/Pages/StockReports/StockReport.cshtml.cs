using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.StockReports;

public class StockReportModel : PageModel
{
    private readonly ILogger<StockReportModel> _logger;

    public StockReportModel(ILogger<StockReportModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
    }
}
