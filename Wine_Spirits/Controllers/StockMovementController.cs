using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers
{
    public class StockMovementController : BaseController
    {
        private readonly WineSpiritsContext _context;

        public StockMovementController(WineSpiritsContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var movements = await _context.StockMovements
                .Include(s => s.Product)
                .ThenInclude(p => p.ProductDefinition)
                .Where(s => s.Product != null && s.Product.ProductDefinition != null && !s.IsDeleted)
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();
            return View(movements);
        }

        public IActionResult Create()
        {
            PopulateDropdowns();
            return IsAjaxRequest ? PartialView("_StockMovementFormPartial", new StockMovement()) : View(new StockMovement());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(StockMovement movement)
        {
            if (ModelState.IsValid)
            {
                movement.Id = Guid.NewGuid();
                movement.CreatedDate = DateTime.Now;
                movement.Date = movement.Date ?? DateTime.Now;
                _context.Add(movement);
                await _context.SaveChangesAsync();

                return IsAjaxRequest ? JsonSuccess("Stok hareketi eklendi.") : RedirectToAction(nameof(Index));
            }

            PopulateDropdowns(movement.ProductId);
            return IsAjaxRequest ? PartialView("_StockMovementFormPartial", movement) : View(movement);
        }

        public async Task<IActionResult> Edit(Guid id)
        {
            var movement = await _context.StockMovements.FindAsync(id);
            if (movement == null) return NotFound();

            PopulateDropdowns(movement.ProductId);
            return IsAjaxRequest ? PartialView("_StockMovementFormPartial", movement) : View(movement);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, StockMovement movement)
        {
            if (id != movement.Id) return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(movement);
                    await _context.SaveChangesAsync();
                    return IsAjaxRequest ? JsonSuccess("Stok hareketi güncellendi.") : RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.StockMovements.AnyAsync(e => e.Id == movement.Id)) return NotFound();
                    throw;
                }
            }

            PopulateDropdowns(movement.ProductId);
            return IsAjaxRequest ? PartialView("_StockMovementFormPartial", movement) : View(movement);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            var movement = await _context.StockMovements.FindAsync(id);
            if (movement == null) return NotFound();

            movement.IsDeleted = true;
            _context.Update(movement);
            await _context.SaveChangesAsync();

            return JsonSuccess("Stok hareketi silindi.");
        }

        private void PopulateDropdowns(object? selectedProduct = null)
        {
            ViewBag.ProductId = new SelectList(_context.Products.Include(p => p.ProductDefinition).Select(p => new { Id = p.Id, Name = p.ProductDefinition.Name }), "Id", "Name", selectedProduct);
            ViewBag.WarehouseId = new SelectList(_context.WareHouses, "Id", "Name");
        }
    }
}
