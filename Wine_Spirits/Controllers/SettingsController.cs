using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;
using System.Security.Claims;

namespace Wine_Spirits.Controllers
{
    [Authorize]
    public class SettingsController : Controller
    {
        private readonly WineSpiritsContext _context;

        public SettingsController(WineSpiritsContext context)
        {
            _context = context;
        }

        // GET: Settings/Index
        public async Task<IActionResult> Index()
        {
            var username = User.Identity?.Name;
            var currentUser = await _context.AppUsers
                .FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);

            // SuperAdmin veya Admin ise tüm personeli de yükle
            List<AppUser> allUsers = new();
            if (User.IsInRole("SuperAdmin") || User.IsInRole("Admin") || User.IsInRole("Manager"))
            {
                allUsers = await _context.AppUsers
                    .Where(u => !u.IsDeleted)
                    .OrderBy(u => u.Role)
                    .ThenBy(u => u.FullName)
                    .ToListAsync();
            }

            var vm = new SettingsViewModel
            {
                CurrentUser = currentUser ?? new AppUser(),
                AllUsers    = allUsers
            };

            return View(vm);
        }

        // POST: Settings/UpdateProfile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(string fullName, string? position)
        {
            var username = User.Identity?.Name;
            var user = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);
            if (user == null) return Json(new { success = false, message = "Kullanıcı bulunamadı." });

            user.FullName = fullName;
            user.Position = position;
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Profil bilgileri güncellendi." });
        }

        // POST: Settings/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(string currentPassword, string newPassword, string confirmPassword)
        {
            if (newPassword != confirmPassword)
                return Json(new { success = false, message = "Yeni şifreler eşleşmiyor." });

            if (newPassword.Length < 4)
                return Json(new { success = false, message = "Şifre en az 4 karakter olmalıdır." });

            var username = User.Identity?.Name;
            var user = await _context.AppUsers.FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);
            if (user == null) return Json(new { success = false, message = "Kullanıcı bulunamadı." });

            if (!Helpers.PasswordHasher.VerifyPassword(currentPassword, user.Password))
                return Json(new { success = false, message = "Mevcut şifre yanlış." });

            user.Password = Helpers.PasswordHasher.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Şifre başarıyla değiştirildi." });
        }

        // POST: Settings/UpdateUserRole  — Sadece SuperAdmin / Admin
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "SuperAdmin,Admin,Sistem Yöneticisi,Yönetici")]
        public async Task<IActionResult> UpdateUserRole(Guid userId, UserRole role)
        {
            var user = await _context.AppUsers.FindAsync(userId);
            if (user == null) return Json(new { success = false, message = "Kullanıcı bulunamadı." });

            user.Role = role;
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = $"{user.FullName} rolü güncellendi." });
        }

        // POST: Settings/ToggleUserActive  — Sadece SuperAdmin / Admin
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "SuperAdmin,Admin,Sistem Yöneticisi,Yönetici")]
        public async Task<IActionResult> ToggleUserActive(Guid userId)
        {
            var user = await _context.AppUsers.FindAsync(userId);
            if (user == null) return Json(new { success = false, message = "Kullanıcı bulunamadı." });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            var status = user.IsActive ? "aktif" : "pasif";
            return Json(new { success = true, message = $"{user.FullName} hesabı {status} yapıldı." });
        }
    }
}
