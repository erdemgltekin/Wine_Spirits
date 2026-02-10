using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

// [Manual Controller]: Kategori yönetimi için manuel olarak oluşturduğumuz Controller.
// Birim (Units) yönetimindeki prensipleri burada da uyguluyoruz.
public class ProductCategoriesController : Controller
{
    private readonly WineSpiritsContext _context;

    public ProductCategoriesController(WineSpiritsContext context)
    {
        _context = context;
    }

    // GET: ProductCategories
    public async Task<IActionResult> Index()
    {
        // [Async List]: Tüm kategorileri asenkron olarak listeliyoruz.
        return View(await _context.ProductCategory.ToListAsync());
    }

    // GET: ProductCategories/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: ProductCategories/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name")] ProductCategory productCategory)
    {
        // [ID Logic]: ID veritabanı tarafından otomatik oluşturulacağı için
        // Validasyon kontrolünden "Id" alanını çıkarıyoruz.
        ModelState.Remove("Id");
        
        if (ModelState.IsValid)
        {
            _context.Add(productCategory);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(productCategory);
    }

    // GET: ProductCategories/Edit/5
    public async Task<IActionResult> Edit(Guid? id)
    {
        if (id == null) return NotFound();

        var productCategory = await _context.ProductCategory.FindAsync(id);
        if (productCategory == null) return NotFound();

        return View(productCategory);
    }

    // POST: ProductCategories/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, [Bind("Id,Name")] ProductCategory productCategory)
    {
        // [Security]: URL ID'si ile Form ID'sinin eşleştiğini doğruluyoruz.
        if (id != productCategory.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                // [Update Logic]: ID değiştirilmeden, sadece Name gibi alanlar güncellenir.
                _context.Update(productCategory);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductCategoryExists(productCategory.Id)) return NotFound();
                else throw;
            }
            return RedirectToAction(nameof(Index));
        }
        return View(productCategory);
    }

    // GET: ProductCategories/Delete/5
    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null) return NotFound();

        var productCategory = await _context.ProductCategory
            .FirstOrDefaultAsync(m => m.Id == id);
        
        if (productCategory == null) return NotFound();

        return View(productCategory);
    }

    // POST: ProductCategories/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id)
    {
        var productCategory = await _context.ProductCategory.FindAsync(id);
        if (productCategory != null)
        {
            _context.ProductCategory.Remove(productCategory);
        }
        
        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool ProductCategoryExists(Guid id)
    {
        return _context.ProductCategory.Any(e => e.Id == id);
    }
}
