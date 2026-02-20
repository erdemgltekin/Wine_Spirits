namespace Wine_Spirits.Models.ViewModels;

public class StatCardViewModel
{
    public string StatKey { get; set; }
    public string Label { get; set; }
    public string Value { get; set; }
    public string Icon { get; set; }
    public string IconClass { get; set; }
    public bool HideIcon { get; set; } = false; // Flag to conditionally hide the icon box
}