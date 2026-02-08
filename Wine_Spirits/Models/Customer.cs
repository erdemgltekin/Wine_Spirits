using System.ComponentModel.DataAnnotations;

namespace Wine_Spirits.Models;

public partial class Customer
{
    public Guid Id { get; set; }

    [Display(Name = "Müşteri Adı")]
    [Required(ErrorMessage = "Müşteri adı boş bırakılamaz.")]
    public string Name { get; set; }

    [Display(Name = "Müşteri Soyadı")]
    [Required(ErrorMessage = "Müşteri soyadı boş bırakılamaz.")]
    public string Lastname { get; set; }

    [Display(Name = "E-Posta")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
    public string Email { get; set; }

    [Display(Name = "Telefon No")]
    [Required(ErrorMessage = "Telefon numarası zorunludur.")]
    public string Phone { get; set; }

    [Display(Name = "Adres Detayları")]
    [Required(ErrorMessage = "Adres bilgisi gereklidir.")]
    public string Adress { get; set; }

    [Display(Name = "Vergi Dairesi")]
    public string TaxOffice { get; set; }

    [Display(Name = "Vergi Numarası")]
    public int TaxNumber { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}