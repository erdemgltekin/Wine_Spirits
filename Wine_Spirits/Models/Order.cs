using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Order : BaseEntity
{
    // Id, BaseEntity'den miras alınıyor — burada tekrar tanımlamaya gerek yok.

    public Guid? CustomerId { get; set; }

    public DateTime OrderDate { get; set; }

    public string Description { get; set; } = null!;

    public Guid? WarehouseId { get; set; }

    public DateTime CreatedDate { get; set; }

    public virtual Customer? Customer { get; set; }
    public virtual WareHouse? Warehouse { get; set; }
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    
}
