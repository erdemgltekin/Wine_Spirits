namespace Wine_Spirits.Models;

public partial class WareHouse : BaseEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Location { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

}
