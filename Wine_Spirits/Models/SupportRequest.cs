using System.ComponentModel.DataAnnotations;

namespace Wine_Spirits.Models;

public partial class SupportRequest
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(100)]
    [Display(Name = "Talep Tipi")]
    public string RequestType { get; set; } // 'Kategori', 'Ülke', 'Birim', 'Tanım'

    [Required]
    [StringLength(255)]
    [Display(Name = "Önerilen İsim")]
    public string SuggestedName { get; set; }

    [Display(Name = "Durum")]
    public int Status { get; set; } = 0; // 0: Bekliyor, 1: Onaylandı, 2: Reddedildi

    [Display(Name = "Oluşturulma Tarihi")]
    public DateTime CreatedDate { get; set; } = DateTime.Now;
}
