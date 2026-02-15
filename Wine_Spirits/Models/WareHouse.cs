namespace Wine_Spirits.Models;

public partial class WareHouse : BaseEntity
{
    // [DİKKAT]: 'public Guid Id { get; set; }' satırını sildik! 
    // Artık bu bilgi BaseEntity'den geliyor.

    public string Name { get; set; } = null!;
    public string? Location { get; set; }

    // Navigation Properties (İlişkili tablolar) olduğu gibi kalıyor.
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}