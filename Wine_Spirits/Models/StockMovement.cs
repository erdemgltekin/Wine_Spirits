using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wine_Spirits.Models;

/// <summary>
/// Stok hareketlerini (Giriş/Çıkış) temsil eden model sınıfı.
/// </summary>
public partial class StockMovement
{
    [Key]
    public Guid Id { get; set; }

    [Display(Name = "Ürün")]
    [Required(ErrorMessage = "Lütfen bir ürün seçiniz.")]
    public Guid ProductId { get; set; }

    [Display(Name = "Miktar")]
    [Required(ErrorMessage = "Lütfen miktar giriniz.")]
    public int Quantity { get; set; }

    [Display(Name = "İşlem Tipi")]
    [Required(ErrorMessage = "İşlem tipi belirtilmelidir.")]
    [MaxLength(20)]
    public string MovementType { get; set; } = "Giriş"; // "Giriş" veya "Çıkış"

    [Display(Name = "İşlem Tarihi")]
    public DateTime Date { get; set; } = DateTime.Now;

    [Display(Name = "Açıklama")]
    [MaxLength(500)]
    public string? Description { get; set; }

    // Navigasyon Özellikleri
    public virtual Product? Product { get; set; }
}
