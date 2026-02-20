using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Supplier
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;

    public Guid CountryId { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedDate { get; set; }

    public bool IsActive { get; set; }

    public Guid? WarehouseId { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
