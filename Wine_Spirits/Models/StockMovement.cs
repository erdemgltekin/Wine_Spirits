using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class StockMovement
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public string MovementType { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime Date { get; set; }

    public string? Description { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedDate { get; set; }

    public virtual Product Product { get; set; } = null!;
}
