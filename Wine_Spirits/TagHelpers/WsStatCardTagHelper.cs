using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text;

namespace Wine_Spirits.TagHelpers;

[HtmlTargetElement("ws-stat-card")]
public class WsStatCardTagHelper : TagHelper
{
    public string Label { get; set; } = "";
    public string Value { get; set; } = "";
    public string Icon { get; set; } = "box";
    public string IconClass { get; set; } = "bg-indigo-50 text-indigo-600";
    public string? Trend { get; set; }
    public string? TrendClass { get; set; }
    public string? Info { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "div";
        output.TagMode = TagMode.StartTagAndEndTag; // KRİTİK: Self-closing tag'lerde content render edilmez, bu satır ZORUNLU
        output.Attributes.SetAttribute("class", "ws-card ws-stat-card shadow-sm border-0");

        var sb = new StringBuilder();
        sb.Append(@$"
            <div class=""card-body p-4"">
                <div class=""d-flex align-items-center justify-content-between mb-3"">
                    <div class=""ws-icon-box {IconClass}"">
                        <i data-lucide=""{Icon}""></i>
                    </div>
                    {(Trend != null ? @$"<div class=""text-xs {TrendClass}"">{Trend}</div>" : "")}
                </div>
                <div>
                    <div class=""text-muted small fw-medium mb-1"">{Label}</div>
                    <div class=""h4 fw-bold mb-0 text-dark"">{Value}</div>
                    {(Info != null ? @$"<div class=""text-xs text-muted mt-1"">{Info}</div>" : "")}
                </div>
            </div>");

        output.Content.SetHtmlContent(sb.ToString());
    }
}
