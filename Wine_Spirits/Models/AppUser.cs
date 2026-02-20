using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class AppUser : BaseEntity
{
    public Guid Id { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? FullName { get; set; }

    public string? Position { get; set; }

    public DateTime CreatedDate { get; set; }

    public UserRole Role { get; set; }
}

public enum UserRole
{
    SuperAdmin = 0,
    Admin = 1,
    Manager = 2,
    Staff = 3
}