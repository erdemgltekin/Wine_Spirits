using Microsoft.AspNetCore.Mvc;

namespace Wine_Spirits.Controllers
{
    public abstract class BaseController : Controller
    {
        protected bool IsAjaxRequest => Request.Headers["X-Requested-With"] == "XMLHttpRequest";

        // ARTIK GERÇEK: Session'dan pozisyon bilgisini alıyoruz
        // Eğer giriş yapılmamışsa varsayılan olarak "Misafir" döner
        protected string CurrentUserPosition => HttpContext.Session.GetString("Position") ?? "Misafir";

        protected bool IsMudur => CurrentUserPosition == "Müdür";
        protected bool IsMudurYardimcisi => CurrentUserPosition == "Müdür Yardımcısı";

        // Yetki: Sadece en üst iki unvan silebilir
        protected bool CanDelete => IsMudur || IsMudurYardimcisi;

        protected JsonResult JsonSuccess(string message) => Json(new { success = true, message });
        protected JsonResult JsonError(string message) => Json(new { success = false, message });
    }
}