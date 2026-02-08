using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public class ReportsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
