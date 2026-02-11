using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using System.Text.Json;

namespace Wine_Spirits.Controllers;

public class ProductsController : Controller
{
    private readonly WineSpiritsContext _context;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public ProductsController(WineSpiritsContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm ürünleri filtreler ve JSON olarak döndürür.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProductsData()
    {
        var products = await _context.Product
            .Include(p => p.ProductDefinition)
            .Include(p => p.ProductCategory)
            .Include(p => p.Unit)
            .Include(p => p.Supplier)
            .Include(p => p.Country)
            .OrderByDescending(p => p.Year)
            .Select(p => new
            {
                p.Id,
                Name = p.ProductDefinition != null ? p.ProductDefinition.Name : "Tanımsız Ürün",
                CategoryName = p.ProductCategory != null ? p.ProductCategory.Name : "Genel",
                CategoryId = p.ProductCategoryId,
                p.Price,
                p.StockQuantity,
                UnitName = p.Unit != null ? p.Unit.Name : "Adet",
                SupplierName = p.Supplier != null ? p.Supplier.Name : "-",
                CountryName = p.Country != null ? p.Country.Name : "-",
                p.Year
            })
            .ToListAsync();

        return new JsonResult(products, _jsonOptions);
    }

    /// <summary>
    /// Filtreleme için kategorileri getirir.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.ProductCategory
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();
        return new JsonResult(categories, _jsonOptions);
    }

    // GET: Products
    public async Task<IActionResult> Index()
    {
        // Include: ProductDefinition dahil edildi.
        var wineSpiritsContext = _context.Product
            .Include(p => p.ProductDefinition)
            .Include(p => p.Country)
            .Include(p => p.ProductCategory)
            .Include(p => p.Supplier)
            .Include(p => p.Unit);
        
        // ToListAsync: Veritabanı sorgusunu asenkron olarak çalıştırır ve sonucu listeye çevirir.
        // 'await' anahtar kelimesi işlemin bitmesini beklerken thread'i bloklamaz.
        return View(await wineSpiritsContext.ToListAsync());
    }

    // GET: Products/Details/5
    public async Task<IActionResult> Details(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var product = await _context.Product
            .Include(p => p.ProductDefinition)
            .Include(p => p.Country)
            .Include(p => p.ProductCategory)
            .Include(p => p.Supplier)
            .Include(p => p.Unit)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (product == null)
        {
            return NotFound();
        }

        return View(product);
    }

    // GET: Products/Create
    public IActionResult Create()
    {
        ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinition.OrderBy(x => x.Name), "Id", "Name");
        ViewData["CountryId"] = new SelectList(_context.Country, "Id", "Name");
        ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategory, "Id", "Name");
        ViewData["SupplierId"] = new SelectList(_context.Supplier, "Id", "Name");
        ViewData["UnitId"] = new SelectList(_context.Unit, "Id", "Name");
        
        // Üretim yılı listesi (1990 - Güncel Yıl, Azalan)
        ViewBag.Years = Enumerable.Range(1990, DateTime.Now.Year - 1989)
                                  .OrderByDescending(x => x)
                                  .Select(x => new SelectListItem { Value = x.ToString(), Text = x.ToString() });
        
        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView();
        }
        return View();
    }


    // [HttpPost]: Bu metodun sadece HTTP POST isteklerini (örn: form gönderimi) karşılayacağını belirtir.
    // [ValidateAntiForgeryToken]: Siteler arası istek sahteciliğine (CSRF) karşı güvenlik önlemi sağlar.
    // [Bind(...)]: Güvenlik için sadece belirtilen alanların formdan alınmasına izin verir (Overposting saldırılarını önler).
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("ProductDefinitionId,ProductCategoryId,CountryId,Year,UnitId,Price,SupplierId,StockQuantity")] Product product)
    {
        if (ModelState.IsValid)
        {
            _context.Add(product);
            await _context.SaveChangesAsync();
            
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(new { success = true });
            }
            return RedirectToAction(nameof(Index));
        }

        ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinition.OrderBy(x => x.Name), "Id", "Name", product.ProductDefinitionId);
        ViewData["CountryId"] = new SelectList(_context.Country, "Id", "Name", product.CountryId);
        ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategory, "Id", "Name", product.ProductCategoryId);
        ViewData["SupplierId"] = new SelectList(_context.Supplier, "Id", "Name", product.SupplierId);
        ViewData["UnitId"] = new SelectList(_context.Unit, "Id", "Name", product.UnitId);
        
        ViewBag.Years = Enumerable.Range(1990, DateTime.Now.Year - 1989)
                                  .OrderByDescending(x => x)
                                  .Select(x => new SelectListItem { Value = x.ToString(), Text = x.ToString() });

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView(product);
        }
        return View(product);
    }
    // [Cleanup]: CreatePartial metodunu sildik çünkü artık tam sayfa (Create.cshtml) kullanıyoruz.

    // GET: Products/Edit/5
    public async Task<IActionResult> Edit(Guid? id)
    {
        if (id == null) return NotFound();

        var product = await _context.Product.FindAsync(id);
        if (product == null) return NotFound();

        ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinition.OrderBy(x => x.Name), "Id", "Name", product.ProductDefinitionId);
        ViewData["CountryId"] = new SelectList(_context.Country, "Id", "Name", product.CountryId);
        ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategory, "Id", "Name", product.ProductCategoryId);
        ViewData["SupplierId"] = new SelectList(_context.Supplier, "Id", "Name", product.SupplierId);
        ViewData["UnitId"] = new SelectList(_context.Unit, "Id", "Name", product.UnitId);

        ViewBag.Years = Enumerable.Range(1990, DateTime.Now.Year - 1989)
                                  .OrderByDescending(x => x)
                                  .Select(x => new SelectListItem { Value = x.ToString(), Text = x.ToString() });

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView(product);
        }
        return View(product);
    }

    // POST: Products/Edit/5
    // To protect from overposting attacks, enable the specific properties you want to bind to.
    // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, [Bind("Id,ProductDefinitionId,ProductCategoryId,CountryId,Year,UnitId,Price,SupplierId,StockQuantity")] Product product)
    {
        if (id != product.Id) return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(product);
                await _context.SaveChangesAsync();
                
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { success = true });
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(product.Id)) return NotFound();
                else throw;
            }
            return RedirectToAction(nameof(Index));
        }
        ViewData["ProductDefinitionId"] = new SelectList(_context.ProductDefinition.OrderBy(x => x.Name), "Id", "Name", product.ProductDefinitionId);
        ViewData["CountryId"] = new SelectList(_context.Country, "Id", "Name", product.CountryId);
        ViewData["ProductCategoryId"] = new SelectList(_context.ProductCategory, "Id", "Name", product.ProductCategoryId);
        ViewData["SupplierId"] = new SelectList(_context.Supplier, "Id", "Name", product.SupplierId);
        ViewData["UnitId"] = new SelectList(_context.Unit, "Id", "Name", product.UnitId);

        ViewBag.Years = Enumerable.Range(1990, DateTime.Now.Year - 1989)
                                  .OrderByDescending(x => x)
                                  .Select(x => new SelectListItem { Value = x.ToString(), Text = x.ToString() });

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView(product);
        }
        return View(product);
    }

    // GET: Products/Delete/5
    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var product = await _context.Product
            .Include(p => p.ProductDefinition)
            .Include(p => p.Country)
            .Include(p => p.ProductCategory)
            .Include(p => p.Supplier)
            .Include(p => p.Unit)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (product == null)
        {
            return NotFound();
        }

        return View(product);
    }

    // POST: Products/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id)
    {
        var product = await _context.Product.FindAsync(id);
        if (product != null)
        {
            _context.Product.Remove(product);
        }

        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool ProductExists(Guid id)
    {
        return _context.Product.Any(e => e.Id == id);
    }
}
