using System.ComponentModel.DataAnnotations;

namespace Wine_Spirits.Models;

public partial class ProductDefinition
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(255)]
    [Display(Name = "Ürün Tanımı")]
    public string Name { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
