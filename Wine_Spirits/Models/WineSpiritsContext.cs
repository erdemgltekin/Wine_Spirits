using Microsoft.EntityFrameworkCore;

namespace Wine_Spirits.Models;

public partial class WineSpiritsContext : DbContext
{
    public WineSpiritsContext(DbContextOptions<WineSpiritsContext> options)
        : base(options)
    {
    }

    // [DBSET LİSTESİ] - Mimari gereği hepsi TEKİL isimlendirilmiştir.
    public virtual DbSet<Country> Country { get; set; }
    public virtual DbSet<Customer> Customer { get; set; }
    public virtual DbSet<Order> Order { get; set; }
    public virtual DbSet<OrderDetail> OrderDetail { get; set; }
    public virtual DbSet<Product> Product { get; set; }
    public virtual DbSet<ProductDefinition> ProductDefinition { get; set; }
    public virtual DbSet<ProductCategory> ProductCategory { get; set; }
    public virtual DbSet<Supplier> Supplier { get; set; }
    public virtual DbSet<Unit> Unit { get; set; }
    public virtual DbSet<WareHouse> WareHouse { get; set; }
    public virtual DbSet<SupportRequest> SupportRequest { get; set; }
    public virtual DbSet<StockMovement> StockMovement { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Country Yapılandırması
        modelBuilder.Entity<Country>(entity =>
        {
            entity.ToTable("Country");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
        });

        // Customer Yapılandırması
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customer");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Adress).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Lastname).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(15);
            entity.Property(e => e.TaxOffice).IsRequired().HasMaxLength(100);
        });

        // Order Yapılandırması
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("Order");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.OrderDate).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Customer");

            entity.HasOne(d => d.Warehouse).WithMany(p => p.Orders)
                .HasForeignKey(d => d.WarehouseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_WareHouse");
        });

        // OrderDetail Yapılandırması
        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.ToTable("OrderDetail");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderDetail_Order");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderDetail_Product");
        });

        // Product Yapılandırması
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Product");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.ProductDefinition).WithMany(p => p.Products)
                .HasForeignKey(d => d.ProductDefinitionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_ProductDefinition");

            entity.HasOne(d => d.Country).WithMany(p => p.Products)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Country");

            entity.HasOne(d => d.ProductCategory).WithMany(p => p.Products)
                .HasForeignKey(d => d.ProductCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_ProductCategory");

            entity.HasOne(d => d.Supplier).WithMany(p => p.Products)
                .HasForeignKey(d => d.SupplierId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Supplier");

            entity.HasOne(d => d.Unit).WithMany(p => p.Products)
                .HasForeignKey(d => d.UnitId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Product_Unit");
        });

        // ProductCategory Yapılandırması
        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.ToTable("ProductCategory");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // ProductDefinition Yapılandırması
        modelBuilder.Entity<ProductDefinition>(entity =>
        {
            entity.ToTable("ProductDefinition");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
        });

        // Supplier Yapılandırması
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.ToTable("Supplier");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Email).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(15);

            entity.HasOne(d => d.Country).WithMany(p => p.Suppliers)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Supplier_Country");
        });

        // Unit Yapılandırması
        modelBuilder.Entity<Unit>(entity =>
        {
            entity.ToTable("Unit");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
        });

        // WareHouse Yapılandırması
        modelBuilder.Entity<WareHouse>(entity =>
        {
            entity.ToTable("WareHouse");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Location).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
        });

        // SupportRequest Yapılandırması
        modelBuilder.Entity<SupportRequest>(entity =>
        {
            entity.ToTable("SupportRequest");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.RequestType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SuggestedName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
        });

        // StockMovement Yapılandırması (Yeni Eklenen)
        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.ToTable("StockMovement");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.MovementType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Date).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Product).WithMany()
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_StockMovement_Product");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}