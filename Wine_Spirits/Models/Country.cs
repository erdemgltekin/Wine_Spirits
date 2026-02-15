using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Country : BaseEntity
{

    public string Name { get; set; } = null!;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();
}
