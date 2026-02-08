using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public class StockReportsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
