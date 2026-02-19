using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers
{
    public class CustomersController : Controller
    {
        private readonly WineSpiritsContext _context;

        public CustomersController(WineSpiritsContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var customers = await _context.Customers
                .Where(c => !c.IsDeleted)
                .Include(c => c.Orders)
                    .ThenInclude(o => o.OrderDetails)
                .ToListAsync();

            var stats = new CustomerStats
            {
                TotalCustomers = customers.Count,
                ActiveCustomers = customers.Count(c => c.IsActive), // GLOBAL: Yeni IsActive alanına göre hesapla
                TotalOrders = customers.Sum(c => c.Orders.Count),
                TotalRevenue = customers
                    .SelectMany(c => c.Orders)
                    .SelectMany(o => o.OrderDetails)
                    .Sum(od => od.TotalPrice)
                    .ToString("C2", new System.Globalization.CultureInfo("tr-TR"))
            };

            var viewModel = new CustomersIndexViewModel
            {
                Customers = customers,
                Stats = stats
            };

            return View(viewModel);
        }

        // GET: Customers/Create
        public IActionResult Create()
        {
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView();
            }
            return View();
        }

        // POST: Customers/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Name,Lastname,Email,Phone,Adress,TaxOffice,TaxNumber")] Customer customer)
        {
            if (ModelState.IsValid)
            {
                customer.Id = Guid.NewGuid();
                _context.Add(customer);
                await _context.SaveChangesAsync();

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { success = true });
                }
                return RedirectToAction(nameof(Index));
            }

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView(customer);
            }
            return View(customer);
        }

        // GET: Customers/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null) return NotFound();

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView(customer);
            }
            return View(customer);
        }

        // POST: Customers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Lastname,Email,Phone,Adress,TaxOffice,TaxNumber")] Customer customer)
        {
            if (id != customer.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(customer);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CustomerExists(customer.Id)) return NotFound();
                    throw;
                }

                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { success = true });
                }
                return RedirectToAction(nameof(Index));
            }

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView(customer);
            }
            return View(customer);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            // BURADA: Database First IsActive kontrolü yapılıyor
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            customer.IsActive = !customer.IsActive;
            await _context.SaveChangesAsync();

            return Json(new { success = true, isActive = customer.IsActive });
        }

        [HttpPost]
        public async Task<IActionResult> Delete(Guid id)
        {
            // BURADA: Soft-delete mantığı uygulanıyor (IsDeleted = true)
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            customer.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }

        private bool CustomerExists(Guid id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}

