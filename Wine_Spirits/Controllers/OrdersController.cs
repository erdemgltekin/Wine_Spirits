using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
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

        // GET: Orders/Create
        public async Task<IActionResult> Create()
        {
            try
            {
                await PopulateSelectListsAsync();
                
                // AJAX çağrısı ise sadece Formu (Partial), normal çağrı ise Create.cshtml'i (View) dön
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                    return PartialView("_OrderCreatePartial", new Order { OrderDate = DateTime.Now });

                return View(new Order { OrderDate = DateTime.Now });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Create GET Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                
                // Return error response for AJAX calls
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    Response.StatusCode = 500;
                    return Content($"Internal Server Error: {ex.Message}", "text/plain");
                }
                
                return View("Error");
            }
        }

        // POST: Orders/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Order order)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    order.Id = Guid.NewGuid();
                    _context.Add(order);
                    await _context.SaveChangesAsync();

                    return Json(new { success = true, message = "Sipariş başarıyla oluşturuldu." });
                }

                // Validasyon hatalarını kullanıcıya döndür
                var errorList = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Json(new { success = false, message = string.Join(" | ", errorList) });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Create POST Error: {ex.Message}");
                return Json(new { success = false, message = "Sipariş oluşturulurken bir hata oluştu: " + ex.Message });
            }
        }

        private async Task PopulateSelectListsAsync(Order order = null)
        {
            try
            {
                // Fetch dropdown data sequentially with AsNoTracking to avoid connection/latency issues
                var customers = await _context.Customers.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
                var warehouses = await _context.WareHouses.AsNoTracking().OrderBy(x => x.Name).ToListAsync();

                ViewBag.Customers = new SelectList(customers, "Id", "Name", order?.CustomerId);
                ViewBag.Warehouses = new SelectList(warehouses, "Id", "Name", order?.WarehouseId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PopulateSelectListsAsync Error: {ex.Message}");
                
                // Fallback to empty lists to prevent modal crash
                ViewBag.Customers = new SelectList(Enumerable.Empty<Customer>(), "Id", "Name");
                ViewBag.Warehouses = new SelectList(Enumerable.Empty<WareHouse>(), "Id", "Name");
            }
        }
    }
}
