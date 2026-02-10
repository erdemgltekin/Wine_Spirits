using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. ADIM: MVC Controller ve View desteğini ekle (Eğitim: Bu satır olmazsa Controller'lar çalışmaz)
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<WineSpiritsContext>(options => options.UseSqlServer(connectionString));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// 2. ADIM: MVC Rota şablonunu tanımla (Eğitim: URL'den Controller/Action eşleşmesini bu sağlar)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();