using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class ProductCategory
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public DateTime CreatedDate { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
