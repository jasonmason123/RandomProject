using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Entities;
using DemoAuthWebBackend.Repository._GenericRepo;
using DemoAuthWebBackend.Repository._QueryParams;
using DemoAuthWebBackend.Utils;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using System.Linq.Expressions;
using X.PagedList;
using X.PagedList.Extensions;

namespace DemoAuthWebBackend.Repository.ProductRepository
{
    public class ProductRepository : GenericRepository<int, Product, ProductQueryParams>, IProductRepository
    {
        public ProductRepository(AppDbContext _appDbContext) : base(_appDbContext)
        {
        }

        public override List<Product> GetList(ProductQueryParams? queryParam = null, Expression<Func<Product, Product>>? selector = null)
        {
            var query = _appDbContext.Products.AsQueryable();
            query = QueryAndSelect(query, queryParam ?? new ProductQueryParams(), selector);
            return query.ToList();
        }

        public override async Task<List<Product>> GetListAsync(ProductQueryParams? queryParam, Expression<Func<Product, Product>>? selector = null)
        {
            var query = _appDbContext.Products.AsQueryable();
            query = QueryAndSelect(query, queryParam, selector);
            return await query.ToListAsync();
        }

        public override IPagedList<Product> GetPagedList(ProductQueryParams? queryParam = null, Expression<Func<Product, Product>>? selector = null)
        {
            queryParam ??= new ProductQueryParams();
            var query = _appDbContext.Products.AsQueryable();
            query = QueryAndSelect(query, queryParam, selector);
            return query.ToPagedList(queryParam.PageNumber, queryParam.PageSize);
        }

        public override Product Update(Product entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _appDbContext.Products.Attach(entity);

            _appDbContext.Entry(entity).Property(x => x.Name).IsModified = true;
            _appDbContext.Entry(entity).Property(x => x.Description).IsModified = true;
            _appDbContext.Entry(entity).Property(x => x.Price).IsModified = true;
            _appDbContext.Entry(entity).Property(x => x.UpdatedAt).IsModified = true;

            return entity;
        }

        private IQueryable<Product> QueryAndSelect(IQueryable<Product> originalQuery, ProductQueryParams? queryParam = null, Expression<Func<Product, Product>>? selector = null)
        {
            if (queryParam != null)
            {
                if (!string.IsNullOrEmpty(queryParam.SearchTerm))
                    originalQuery = originalQuery
                        .Where(x => x.Name.Contains(queryParam.SearchTerm) ||
                                    x.Description.Contains(queryParam.SearchTerm));

                if (queryParam.SortProperty != null && queryParam.SortOrder != null)
                {
                    var expr = HelperMethods.GetPropertyExpression<Product>(queryParam.SortProperty);

                    originalQuery = queryParam.SortOrder == ListSortDirection.Ascending
                        ? originalQuery.OrderBy(expr)
                        : originalQuery.OrderByDescending(expr);
                }

                if(queryParam.FlagDel != null)
                {
                    originalQuery = originalQuery.Where(x => x.FlagDel == queryParam.FlagDel);
                }
            }

            if (selector != null)
                originalQuery = originalQuery.Select(selector);

            return originalQuery;
        }
    }
}
