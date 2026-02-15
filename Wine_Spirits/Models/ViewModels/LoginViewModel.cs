using System.ComponentModel.DataAnnotations;

namespace Wine_Spirits.Models.ViewModels;

public class LoginViewModel
{
    [Required(ErrorMessage = "Kullanıcı adı boş bırakılamaz.")]
    [Display(Name = "Kullanıcı Adı")]
    public string Username { get; set; } = null!;

    [Required(ErrorMessage = "Şifre boş bırakılamaz.")]
    [DataType(DataType.Password)]
    [Display(Name = "Şifre")]
    public string Password { get; set; } = null!;
}