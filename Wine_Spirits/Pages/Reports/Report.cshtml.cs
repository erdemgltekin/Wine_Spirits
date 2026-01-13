using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.Reports;

public class ReportModel : PageModel
{
    private readonly ILogger<ReportModel> _logger;  
    public ReportModel(ILogger<ReportModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
