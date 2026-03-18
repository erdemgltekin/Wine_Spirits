using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wine_Spirits.Models;

namespace Wine_Spirits.Controllers.Api;

[Route("api/products")]
[ApiController]
public class ProductsApiController : ControllerBase
{
    private readonly WineSpiritsContext _context;

    public ProductsApiController(WineSpiritsContext context)
    {
        _context = context;
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetProductList()
    {
        try
        {
            var products = await _context.Products
                .Include(p => p.ProductDefinition)
                .AsNoTracking()
                .Select(p => new {
                    id = p.Id,
                    name = p.ProductDefinition.Name,
                    price = p.Price
                })
                .ToListAsync();

            return Ok(new { products });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Ürünler yüklenirken hata oluştu" });
        }
    }
}
