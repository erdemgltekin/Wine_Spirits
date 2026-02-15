namespace Wine_Spirits.Models;

public class AppUser : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Position { get; set; } // Görsel etiket (Örn: "Gece Müdürü")
    public UserRole Role { get; set; }    // Sistemsel yetki (Enum)
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}

public enum UserRole
{
    SuperAdmin = 1,
    Manager = 2,
    Staff = 3
}