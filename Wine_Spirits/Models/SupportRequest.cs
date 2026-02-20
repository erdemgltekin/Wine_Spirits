using System;
using System.Collections.Generic;

namespace Wine_Spirits.Models;

public partial class SupportRequest
{
    public Guid Id { get; set; }

    public string RequestType { get; set; } = null!;

    public string SuggestedName { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedDate { get; set; }

    public bool IsDeleted { get; set; }
}
