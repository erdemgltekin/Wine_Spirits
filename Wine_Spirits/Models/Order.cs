using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Order : BaseEntity
{

    public Guid CustomerId { get; set; }

    public DateTime OrderDate { get; set; }

    public string Description { get; set; } = null!;

    public Guid WarehouseId { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual WareHouse Warehouse { get; set; } = null!;
}
