using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

// [Manual Controller]: Ülke (Countries) yönetimi için manuel Controller.
public class CountriesController : Controller
{
    private readonly WineSpiritsContext _context;

    public CountriesController(WineSpiritsContext context)
    {
        _context = context;
    }

    // GET: Countries
    public async Task<IActionResult> Index()
    {
        return View(await _context.Country.ToListAsync());
    }

    // GET: Countries/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: Countries/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] Country country)
    {
        // [ID Logic]: ID veritabanı tarafından otomatik oluşturulacağı için
        // Validasyon kontrolünden "Id" alanını çıkarıyoruz.
        ModelState.Remove("Id");

        if (ModelState.IsValid)
        {
            _context.Add(country);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(country);
    }

    // GET: Countries/Edit/5
    public async Task<IActionResult> Edit(Guid? id)
    {
        if (id == null) return NotFound();

        var country = await _context.Country.FindAsync(id);
        if (country == null) return NotFound();

        return View(country);
    }

    // POST: Countries/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name")] Country country)
    {
        if (id != country.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(country);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CountryExists(country.Id)) return NotFound();
                else throw;
            }
            return RedirectToAction(nameof(Index));
        }
        return View(country);
    }

    // GET: Countries/Delete/5
    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null) return NotFound();

        var country = await _context.Country
            .FirstOrDefaultAsync(m => m.Id == id);
        
        if (country == null) return NotFound();

        return View(country);
    }

    // POST: Countries/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id)
    {
        var country = await _context.Country.FindAsync(id);
        if (country != null)
        {
            _context.Country.Remove(country);
        }
        
        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool CountryExists(Guid id)
    {
        return _context.Country.Any(e => e.Id == id);
    }
}
