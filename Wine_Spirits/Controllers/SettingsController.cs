using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public class SettingsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
