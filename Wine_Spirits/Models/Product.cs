using System.ComponentModel.DataAnnotations; // Nitelikler (Attributes) için gerekli kütüphane
using System.ComponentModel.DataAnnotations.Schema; // Veritabanı şema eşleştirmeleri için gerekli

namespace Wine_Spirits.Models;

public partial class Product
{
    // GUID: Benzersiz tanımlayıcı (Primary Key)
    public Guid Id { get; set; }

    [Display(Name = "Ürün Tanımı")]
    [Required(ErrorMessage = "Lütfen bir ürün tanımı seçiniz.")]
    public Guid ProductDefinitionId { get; set; }

    [Display(Name = "Ürün Kategorisi")]
    [Required(ErrorMessage = "Lütfen bir kategori seçiniz.")]
    public Guid ProductCategoryId { get; set; }

    [Display(Name = "Menşei Ülke")]
    [Required(ErrorMessage = "Lütfen bir ülke seçiniz.")]
    public Guid CountryId { get; set; }

    [Display(Name = "Üretim Yılı (vintage)")]
    [Range(1800, 2100, ErrorMessage = "Lütfen geçerli bir yıl giriniz (1800-2100).")]
    public int? Year { get; set; } // 

    [Display(Name = "Ölçü Birimi")]
    [Required(ErrorMessage = "Lütfen birim seçiniz.")]
    public Guid UnitId { get; set; }

    [Display(Name = "Satış Fiyatı")]
    [Required(ErrorMessage = "Fiyat bilgisi girilmelidir.")]
    [DataType(DataType.Currency)]
    public decimal Price { get; set; }

    [Display(Name = "Stok Adedi")]
    [Required(ErrorMessage = "Lütfen stok adedi giriniz.")]
    [Range(0, int.MaxValue, ErrorMessage = "Stok adedi 0'dan küçük olamaz.")] 
    public int StockQuantity { get; set; }

    [Display(Name = "Tedarikçi Firma")]
    [Required(ErrorMessage = "Lütfen tedarikçi seçiniz.")]
    public Guid SupplierId { get; set; }

    // İlişkili Tablolar (Navigation Properties)
    
    [Display(Name = "Ürün Tanımı")]
    public virtual ProductDefinition ProductDefinition { get; set; }

    [Display(Name = "Ülke")]
    public virtual Country Country { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [Display(Name = "Kategori")]
    public virtual ProductCategory ProductCategory { get; set; }

    [Display(Name = "Tedarikçi")]
    public virtual Supplier Supplier { get; set; }

    [Display(Name = "Birim")]
    public virtual Unit Unit { get; set; }

    // [NotMapped]: Bu özelliğin veritabanında bir sütun olarak oluşturulmamasını sağlar.
    // Sadece kod tarafında, hesaplanmış bir değer veya yardımcı özellik olarak kullanılır.
    [NotMapped]
    [Display(Name = "Stok Durumu")]
    public string StockStatus => $"{StockQuantity} {Unit?.Name}"; // Lambda expression (=>) ile sadece okunabilir (read-only) bir özellik
}