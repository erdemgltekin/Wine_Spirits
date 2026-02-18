using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public class StockMovementController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
