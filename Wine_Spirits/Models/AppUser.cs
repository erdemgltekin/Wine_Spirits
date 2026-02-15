namespace Wine_Spirits.Models;

public class AppUser : BaseEntity
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Position { get; set; } 
}