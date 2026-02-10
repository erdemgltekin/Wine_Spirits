using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

public class ManagementController : Controller
{
    private readonly WineSpiritsContext _context;

    public ManagementController(WineSpiritsContext context)
    {
        _context = context;
    }

    // GET: /Management/Backoffice
    public async Task<IActionResult> Backoffice()
    {
        var pendingRequests = await _context.SupportRequest
            .Where(r => r.Status == 0)
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();
        
        return View(pendingRequests);
    }

    [HttpPost]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var request = await _context.SupportRequest.FindAsync(id);
        if (request == null) return NotFound();

        try
        {
            switch (request.RequestType)
            {
                case "Tanım":
                    _context.ProductDefinition.Add(new ProductDefinition { Name = request.SuggestedName });
                    break;
                case "Kategori":
                    _context.ProductCategory.Add(new ProductCategory { Name = request.SuggestedName });
                    break;
                case "Ülke":
                    _context.Country.Add(new Country { Name = request.SuggestedName });
                    break;
                case "Birim":
                    _context.Unit.Add(new Unit { Name = request.SuggestedName });
                    break;
            }

            request.Status = 1; // Onaylandı
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Talep onaylandı ve veritabanına eklendi." });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Hata: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        var request = await _context.SupportRequest.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = 2; // Reddedildi
        await _context.SaveChangesAsync();

        return Json(new { success = true, message = "Talep reddedildi." });
    }
}
