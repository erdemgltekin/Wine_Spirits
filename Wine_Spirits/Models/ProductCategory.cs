using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class ProductCategory : BaseEntity
{

    public string Name { get; set; } = null!;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
