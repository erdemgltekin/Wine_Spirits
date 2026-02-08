using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public class StockMovementsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
