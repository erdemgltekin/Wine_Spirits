using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers
{
    public class WarehousesController : Controller
    {
        private readonly WineSpiritsContext _context;

        public WarehousesController(WineSpiritsContext context)
        {
            _context = context;
        }

        // GET: Warehouses
        public async Task<IActionResult> Index()
        {
            return View(await _context.WareHouses.ToListAsync());
        }

        // GET: Warehouses/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Warehouses/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Name,Location")] WareHouse wareHouse)
        {
            if (ModelState.IsValid)
            {
                wareHouse.Id = Guid.NewGuid(); // Ensure ID is generated if not by DB default (though DB handles newid(), explict setting avoids issues)
                _context.Add(wareHouse);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(wareHouse);
        }

        // GET: Warehouses/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var wareHouse = await _context.WareHouses.FindAsync(id);
            if (wareHouse == null)
            {
                return NotFound();
            }
            return View(wareHouse);
        }

        // POST: Warehouses/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name,Location")] WareHouse wareHouse)
        {
            if (id != wareHouse.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(wareHouse);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!WareHouseExists(wareHouse.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(wareHouse);
        }

        // GET: Warehouses/Delete/5
        public async Task<IActionResult> Delete(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var wareHouse = await _context.WareHouses
                .FirstOrDefaultAsync(m => m.Id == id);
            if (wareHouse == null)
            {
                return NotFound();
            }

            return View(wareHouse);
        }

        // POST: Warehouses/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            var wareHouse = await _context.WareHouses.FindAsync(id);
            if (wareHouse != null)
            {
                _context.WareHouses.Remove(wareHouse);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool WareHouseExists(Guid id)
        {
            return _context.WareHouses.Any(e => e.Id == id);
        }
    }
}
