using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// 1. MVC ve Razor Pages Desteği
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// 2. Veritabanı Bağlantısı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<WineSpiritsContext>(options => options.UseSqlServer(connectionString));

// 3. AUTHENTICATION (KİMLİK DOĞRULAMA) AYARI - KRİTİK ADIM
// Role-based yetkilendirme için bu blok şarttır.
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login"; // Yetkisiz girişte yönlendirilecek sayfa
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied"; // Yetkisi yetmeyenlerin (Personel admin sayfasına girerse) göreceği sayfa
        options.ExpireTimeSpan = TimeSpan.FromHours(8); // Oturum süresi
    });

// 4. Session Ayarları
builder.Services.AddSession(options => {
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// 5. MİDDLEWARE SIRALAMASI - ÇOK ÖNEMLİ
// Önce Authentication (Kim misin?), sonra Authorization (Neye yetkin var?) gelmeli.
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

// 6. Rota Tanımları
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

app.MapRazorPages();

app.Run();