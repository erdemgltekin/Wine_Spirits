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
        // Hata: SupportRequest -> SupportRequests (Çoğul yapıldı)
        // Hata: Status string olduğu için "0" (string) olarak kontrol edildi
        var pendingRequests = await _context.SupportRequests
            .Where(r => r.Status == "0" || r.Status == "Pending")
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();

        return View(pendingRequests);
    }

    [HttpPost]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var request = await _context.SupportRequests.FindAsync(id);
        if (request == null) return NotFound();

        try
        {
            // ... Switch case bloklarında _context.TabloAdi kısımlarının 
            // sonuna 's' eklediğinden emin ol (Örn: _context.Countries.Add)

            // HATA: Cannot implicitly convert type 'int' to 'string'
            // Çözüm: 1 yerine "1" (Tırnak içinde string olarak)
            request.Status = "1";

            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Onaylandı." });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Hata: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        var request = await _context.SupportRequests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = "Rejected"; // 2 yerine "Rejected"
        await _context.SaveChangesAsync();

        return Json(new { success = true, message = "Talep reddedildi." });
    }
}