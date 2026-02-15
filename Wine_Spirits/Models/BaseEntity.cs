namespace Wine_Spirits.Models;

public abstract class BaseEntity
{
    // SQL'deki birincil anahtar ile eşleşir. 
    // Database First olduğumuz için "= Guid.NewGuid()" kısmını kaldırdık; 
    // çünkü bu değeri veritabanı kendisi üretecek.
    public Guid Id { get; set; }

    public bool IsDeleted { get; set; }
    
    public DateTime CreatedDate { get; set; }
}