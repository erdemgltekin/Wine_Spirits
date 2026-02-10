using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

// [Manual Implementation]: Bu Controller'ı Scaffold (otomatik kod üretimi) kullanmadan,
// projenin ihtiyaçlarına tam olarak cevap verecek şekilde manuel olarak tasarladık.
// Bu sayede gereksiz kod kalabalığından kurtuluyor ve performanslı çalışıyoruz.
public class UnitsController : Controller
{
    private readonly WineSpiritsContext _context;

    public UnitsController(WineSpiritsContext context)
    {
        _context = context;
    }

    // GET: Units
    public async Task<IActionResult> Index()
    {
        // [Performance]: Sadece ihtiyacımız olan veriyi çekiyoruz. Scaffold bazen gereksiz Include işlemleri yapabilir.
        // Burada basit bir listeleme yeterli olduğu için düz bir sorgu atıyoruz.
        var units = await _context.Unit.ToListAsync();
        return View(units);
    }

    // GET: Units/Create
    public IActionResult Create()
    {
        // [Simplicity]: View'a herhangi bir veri göndermemize gerek yok,
        // sadece boş bir form sayfası döndürüyoruz.
        return View();
    }

    // POST: Units/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] Unit unit) // Sadece Name'i bekliyoruz
    {
        // [Validation Check]: Name boş değilse devam et
        if (ModelState.IsValid)
        {   
            _context.Add(unit);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(unit);
    }

    // GET: Units/Edit/5
    public async Task<IActionResult> Edit(Guid? id)
    {
        // [Null Check]: ID gelmemişse işlem yapamayız.
        if (id == null) return NotFound();

        var unit = await _context.Unit.FindAsync(id);
        if (unit == null) return NotFound(); // [Existence Check]: Kayıt yoksa 404 dön.

        return View(unit);
    }

    // POST: Units/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name")] Unit unit)
    {
        // [Security]: URL'deki ID ile Form'dan gelen ID eşleşiyor mu?
        if (id != unit.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(unit); // [EF Core]: Entity'nin durumunu Modified olarak işaretler.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // [Concurrency]: Aynı anda başkası sildiyse kontrol et.
                if (!_context.Unit.Any(e => e.Id == id)) return NotFound();
                else throw;
            }
            return RedirectToAction(nameof(Index));
        }
        return View(unit);
    }

    // GET: Units/Delete/5
    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null) return NotFound();

        var unit = await _context.Unit
            .FirstOrDefaultAsync(m => m.Id == id);

        if (unit == null) return NotFound();

        return View(unit);
    }

    // POST: Units/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id)
    {
        var unit = await _context.Unit.FindAsync(id);
        if (unit != null)
        {
            _context.Unit.Remove(unit); // [EF Core]: Silinmek üzere işaretle.
        }

        await _context.SaveChangesAsync(); // [Database]: DELETE komutunu çalıştır.
        return RedirectToAction(nameof(Index));
    }
}
