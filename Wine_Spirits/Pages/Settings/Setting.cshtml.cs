using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Wine_Spirits.Pages.Settings;

public class SettingModel : PageModel
{
    private readonly ILogger<SettingModel> _logger; 
    public SettingModel(ILogger<SettingModel> logger)
    {
        _logger = logger;
    }
    public void OnGet()
    {
    }
}
