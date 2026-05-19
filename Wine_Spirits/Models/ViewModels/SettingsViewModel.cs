using Wine_Spirits.Models;

namespace Wine_Spirits.Models.ViewModels
{
    public class SettingsViewModel
    {
        /// <summary>Giriş yapan kullanıcının kendi bilgileri.</summary>
        public AppUser CurrentUser { get; set; } = new AppUser();

        /// <summary>
        /// Tüm personel listesi — sadece Manager+ rolleri için doldurulur.
        /// Staff rolündeyse bu liste boş gelir (controller seviyesinde kontrol edilir).
        /// </summary>
        public List<AppUser> AllUsers { get; set; } = new();
    }
}
