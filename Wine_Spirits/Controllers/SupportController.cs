using Microsoft.AspNetCore.Mvc;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers;

public class SupportController : Controller
{
    private readonly WineSpiritsContext _context;

    public SupportController(WineSpiritsContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> SendRequest(string type, string name)
    {
        if (string.IsNullOrEmpty(type) || string.IsNullOrEmpty(name))
        {
            return Json(new { success = false, message = "Lütfen tüm alanları doldurunuz." });
        }

        var request = new SupportRequest
        {
            RequestType = type,
            SuggestedName = name,
            Status = "0", // HATA DÜZELTİLDİ: 0 (int) yerine "0" (string) yapıldı.
            CreatedDate = DateTime.Now
        };

        _context.SupportRequests.Add(request); // Çoğul isim kullanımı doğru
        await _context.SaveChangesAsync();

        return Json(new { success = true, message = "Talebiniz iletildi." });
    }
}
