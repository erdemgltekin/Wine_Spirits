using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class Product : BaseEntity
{

    public Guid ProductCategoryId { get; set; }

    public Guid CountryId { get; set; }

    public int? Year { get; set; }

    public Guid UnitId { get; set; }

    public decimal Price { get; set; }

    public Guid SupplierId { get; set; }

    public Guid ProductDefinitionId { get; set; }

    // --- YENİ EKLENEN SÜTUN ---
    public Guid WarehouseId { get; set; }

    public int StockQuantity { get; set; }

    public virtual Country? Country { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ProductCategory? ProductCategory { get; set; }

    public virtual ProductDefinition? ProductDefinition { get; set; }

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual Supplier? Supplier { get; set; }

    public virtual Unit? Unit { get; set; }

    public virtual WareHouse? Warehouse { get; set; }
}