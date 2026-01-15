using Wine_Spirits.Models;

namespace Wine_Spirits.Services;

public interface IProduct
{
    IEnumerable<Product> GetAll();

    IEnumerable<Product> Search(string? query, Guid productId,);
}
