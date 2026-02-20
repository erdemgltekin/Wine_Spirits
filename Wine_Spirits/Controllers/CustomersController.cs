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
            // Context içinde Global Query Filter (IsDeleted) tanımlı olduğu için 
            // burada tekrar .Where(c => !c.IsDeleted) yazmaya gerek yoktur.
            var customer = await _context.Customers
                .Include ( c => c.Orders)
                .ThenInclude(o => o.OrderDetails)
                .ToListAsync();

            // İstatistikleri güvenli bir şekilde hesapla (Null-conditional operasyonları ile)
            var stats = new CustomerStats
            {
                TotalCustomers = customer.Count,
                ActiveCustomers = customer.Count(c => c.IsActive),
                TotalOrders = customer.Sum(c => c.Orders?.Count ?? 0),
                // Ciro hesaplarken decimal cast kullanarak null hatalarını önle ve string'e çevir
                TotalRevenue = (customer
                    .SelectMany(c => c.Orders ?? new List<Order>())
                    .SelectMany(o => o.OrderDetails ?? new List<OrderDetail>())
                    .Sum(od => (decimal?)od.TotalPrice) ?? 0).ToString("C2", new CultureInfo("tr-TR"))
            };

            var viewModel = new CustomersIndexViewModel
            {
                Customer = customer,
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
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Lastname,Email,Phone,Adress,TaxOffice,TaxNumber,IsActive,CreatedDate")] Customer customer)
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

        // POST: Customers/ToggleStatus/5
        [HttpPost]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            customer.IsActive = !customer.IsActive;
            await _context.SaveChangesAsync();

            return Json(new { success = true, isActive = customer.IsActive });
        }

        // POST: Customers/Delete/5
        [HttpPost]
        public async Task<IActionResult> Delete(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            // Database-First Soft Delete Mantığı
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