using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Customer : BaseEntity
{

    public string Name { get; set; } = null!;

    public string Lastname { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Adress { get; set; } = null!;

    public string TaxOffice { get; set; } = null!;

    public int TaxNumber { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
