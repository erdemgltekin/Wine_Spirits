using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;
using System.Globalization;

namespace Wine_Spirits.Controllers
{
    public class CustomersController : Controller
    {
        private readonly WineSpiritsContext _context;

        public CustomersController(WineSpiritsContext context)
        {
            _context = context;
        }

        // GET: Customers
        public async Task<IActionResult> Index()
        {
            // Global IsDeleted filtresinin DbContext içinde tanımlı olduğu varsayılmıştır.
            var customers = await _context.Customers
                .Include(c => c.Orders)
                    .ThenInclude(o => o.OrderDetails)
                .ToListAsync();

            var stats = new CustomerStats
            {
                TotalCustomers = customers.Count,
                ActiveCustomers = customers.Count(c => c.IsActive),
                TotalOrders = customers.Sum(c => c.Orders?.Count ?? 0),
                TotalRevenue = (customers
                    .SelectMany(c => c.Orders ?? new List<Order>())
                    .SelectMany(o => o.OrderDetails ?? new List<OrderDetail>())
                    .Sum(od => (decimal?)od.TotalPrice) ?? 0).ToString("C2", new CultureInfo("tr-TR"))
            };

            var viewModel = new CustomersIndexViewModel
            {
                Customer = customers,
                Stats = stats
            };

            return View(viewModel);
        }

        // GET: Customers/Create
        [HttpGet]
        public IActionResult Create()
        {
            // AJAX isteği gelirse Partial döndür
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                // Dosya yolunu net vererek belirsizliği ortadan kaldırıyoruz
                return PartialView("~/Views/Customers/_CreateCustomerPartial.cshtml", new Customer());
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
                customer.CreatedDate = DateTime.Now;
                customer.IsActive = true;
                customer.IsDeleted = false;

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
                return PartialView("_CreateCustomerPartial", customer);
            }
            return View(customer);
        }

        // GET: Customers/Edit/5
        [HttpGet]
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null) return NotFound();

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView("_EditCustomerPartial", customer);
            }
            return View(customer);
        }

        // POST: Customers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Lastname,Email,Phone,Adress,TaxOffice,TaxNumber,IsActive,CreatedDate")] Customer customer)
        {
            if (id != customer.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    customer.IsDeleted = false; // Soft delete koruması
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
                return PartialView("_EditCustomerPartial", customer);
            }
            return View(customer);
        }

        // POST: Customers/ToggleStatus/5
        [HttpPost]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return Json(new { success = false, message = "Müşteri bulunamadı." });

            customer.IsActive = !customer.IsActive;
            await _context.SaveChangesAsync();

            return Json(new { success = true, isActive = customer.IsActive });
        }

        // POST: Customers/Delete/5
        [HttpPost]
        public async Task<IActionResult> Delete(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return Json(new { success = false, message = "Müşteri bulunamadı." });

            // Soft Delete Uygulaması
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