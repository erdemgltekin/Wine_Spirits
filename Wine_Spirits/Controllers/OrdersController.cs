using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers
{
    public class OrdersController : Controller
    {
        private readonly WineSpiritsContext _context;

        public OrdersController(WineSpiritsContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var orders = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Warehouse);
            return View(await orders.ToListAsync());
        }
    }
}
