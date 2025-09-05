using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Repository._GenericRepo;
using DemoAuthWebBackend.Repository._QueryParams;

namespace DemoAuthWebBackend.Repository.ProductRepository
{
    public interface IProductRepository : IGenericRepository<int, Product, ProductQueryParams>
    {
    }
}
