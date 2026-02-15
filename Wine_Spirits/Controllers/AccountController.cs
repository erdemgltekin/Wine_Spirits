using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Helpers;
using Wine_Spirits.Models;
using Wine_Spirits.Models.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace Wine_Spirits.Controllers;

public partial class AccountController : Controller
{
    private readonly WineSpiritsContext _context;

    public AccountController(WineSpiritsContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Login() => View();

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        // 1. ADIM: SİSTEM SAHİBİ (ADMİN) OTO-OLUŞTURMA
        var checkAdmin = await _context.AppUsers.IgnoreQueryFilters().AnyAsync(u => u.Username == "admin");
        if (!checkAdmin)
        {
            var admin = new AppUser
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Password = PasswordHasher.HashPassword("123456"),
                FullName = "Sistem Yöneticisi",
                Position = "Sistem Yöneticisi",
                Role = UserRole.SuperAdmin,
                IsActive = true,
                IsDeleted = false,
                CreatedDate = DateTime.Now
            };
            _context.AppUsers.Add(admin);
            await _context.SaveChangesAsync();
        }

        // 2. ADIM: GİRİŞ DOĞRULAMA
        if (ModelState.IsValid)
        {
            var user = await _context.AppUsers
                .FirstOrDefaultAsync(u => u.Username == model.Username && !u.IsDeleted);

            if (user != null && PasswordHasher.VerifyPassword(model.Password, user.Password))
            {
                if (!user.IsActive)
                {
                    ModelState.AddModelError("", "Hesabınız askıya alınmıştır.");
                    return View(model);
                }

                // --- YENİ: CLAIMS (KİMLİK KARTI) OLUŞTURMA ---
                // Bu kısım User.IsInRole ve User.Identity.Name'i dolduran kısımdır.
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim("FullName", user.FullName ?? ""),
                    new Claim(ClaimTypes.Role, user.Role.ToString()) // Örn: "SuperAdmin" veya "Staff"
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties { IsPersistent = true };

                // Cookie'yi oluştur ve sisteme giriş yap
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                // Eski Session desteğini de bozmayalım (Layout sayfaların kullanıyor olabilir)
                HttpContext.Session.SetString("Username", user.Username);
                HttpContext.Session.SetString("FullName", user.FullName ?? "Misafir");
                HttpContext.Session.SetInt32("UserRole", (int)user.Role);

                return RedirectToAction("Index", "Dashboard");
            }

            ModelState.AddModelError("", "Kullanıcı adı veya şifre hatalı!");
        }

        return View(model);
    }

    [HttpGet]
    public IActionResult AccessDenied()
    {
        return View(); // Şık bir "Yetkiniz Yok" sayfası tasarlayabilirsin
    }

    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        HttpContext.Session.Clear();
        return RedirectToAction("Login");
    }
}