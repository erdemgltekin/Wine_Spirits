using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text;

namespace Wine_Spirits.TagHelpers;

[HtmlTargetElement("ws-page-header")]
public class WsPageHeaderTagHelper : TagHelper
{
    public string Title { get; set; } = "";
    public string? Subtitle { get; set; }

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "div";
        output.Attributes.SetAttribute("class", "ws-page-header");

        var children = await output.GetChildContentAsync();
        
        var sb = new StringBuilder();
        sb.Append(@$"
            <div>
                <h1 class=""ws-page-title"">{Title}</h1>
                {(Subtitle != null ? @$"<p class=""ws-page-subtitle mb-0"">{Subtitle}</p>" : "")}
            </div>
            <div class=""d-flex gap-3"">
                {children.GetContent()}
            </div>");

        output.Content.SetHtmlContent(sb.ToString());
    }
}
