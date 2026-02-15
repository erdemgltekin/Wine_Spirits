using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Supplier : BaseEntity
{
    
    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;

    public Guid CountryId { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
