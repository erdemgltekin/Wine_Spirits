using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Helpers;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;

namespace Wine_Spirits.Controllers
{
    [Authorize(Roles = "SuperAdmin")]
    public class ManagementController : Controller
    {
        private readonly WineSpiritsContext _context;

        public ManagementController(WineSpiritsContext context)
        {
            _context = context;
        }

        // GET: Management/Users
        public async Task<IActionResult> Users()
        {
            var query = _context.AppUsers.AsQueryable();

            // Sadece silinmemiş kullanıcıları getir
            query = query.Where(x => !x.IsDeleted);

            var users = await query.OrderByDescending(x => x.CreatedDate).ToListAsync();
            return View(users ?? new List<AppUser>());
        }

        // --- BACKOFFICE (TALEP YÖNETİMİ) ---

        public async Task<IActionResult> Backoffice()
        {
            var requests = await _context.SupportRequests
                .Where(x => x.Status == null || x.Status == "Pending")
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> ApproveRequest(Guid id)
        {
            var request = await _context.SupportRequests.FindAsync(id);
            if (request == null) return Json(new { success = false, message = "Talep bulunamadı." });

            request.Status = "Approved";
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Talep başarıyla onaylandı." });
        }

        [HttpPost]
        public async Task<IActionResult> RejectRequest(Guid id)
        {
            var request = await _context.SupportRequests.FindAsync(id);
            if (request == null) return Json(new { success = false, message = "Talep bulunamadı." });

            request.Status = "Rejected";
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Talep reddedildi." });
        }

        // --- KULLANICI İŞLEMLERİ (YENİLENMİŞ) ---

        public IActionResult CreateUser()
        {
            return PartialView("~/Views/Shared/Partials/_UserForm.cshtml", new AppUser());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateUser(AppUser newUser, string plainPassword)
        {
            // KRİTİK: newUser.Password normalde modelde [Required] olduğu için hata verir.
            // Biz şifreyi plainPassword'den hashleyerek alacağımız için Password alanındaki validasyon hatasını siliyoruz.
            ModelState.Remove("Password");
            ModelState.Remove("plainPassword"); // Eğer modelde varsa

            if (string.IsNullOrEmpty(plainPassword) || plainPassword.Length < 4)
            {
                return Json(new { success = false, message = "Lütfen geçerli bir şifre giriniz (En az 4 karakter)." });
            }

            if (ModelState.IsValid)
            {
                try
                {
                    newUser.Id = Guid.NewGuid();
                    newUser.Password = PasswordHasher.HashPassword(plainPassword); // Şifre hashleniyor
                    newUser.CreatedDate = DateTime.Now;
                    newUser.IsActive = true;
                    newUser.IsDeleted = false;

                    // Rol belirleme
                    newUser.Role = newUser.Position switch
                    {
                        "Müdür" => UserRole.Manager,
                        "Müdür Yardımcısı" => UserRole.Manager,
                        "Sistem Yöneticisi" => UserRole.SuperAdmin,
                        _ => UserRole.Staff
                    };

                    _context.AppUsers.Add(newUser);
                    await _context.SaveChangesAsync();

                    return Json(new { success = true, message = "Kullanıcı başarıyla sisteme eklendi." });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Kayıt sırasında bir hata oluştu: " + ex.Message });
                }
            }

            // Eğer ModelState geçersizse, hataları toplayıp arayüze gönderiyoruz:
            var errorMessages = string.Join("<br>", ModelState.Values
                                    .SelectMany(v => v.Errors)
                                    .Select(e => e.ErrorMessage));

            return Json(new { success = false, message = "Lütfen formdaki eksikleri giderin: <br>" + errorMessages });
        }
    }
}