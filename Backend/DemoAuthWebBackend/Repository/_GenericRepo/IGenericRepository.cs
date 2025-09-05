using DemoAuthWebBackend.Entities.Interfaces;
using DemoAuthWebBackend.Repository.QueryParams;
using System.Linq.Expressions;
using X.PagedList;

namespace DemoAuthWebBackend.Repository._GenericRepo
{
    public interface IGenericRepository<TKey, TEntity, TQueryParam>
        where TKey : notnull
        where TEntity : class
        where TQueryParam : BaseQueryParams
    {
        TEntity GetByKey(TKey key);
        List<TEntity> GetList(TQueryParam? queryParam = null, Expression<Func<TEntity, TEntity>>? selector = null);
        IPagedList<TEntity> GetPagedList(TQueryParam? queryParam = null, Expression<Func<TEntity, TEntity>>? selector = null);
        TEntity Create(TEntity entity);
        TEntity Update(TEntity entity);
        void Delete(TEntity entity, bool forceHardDelete = false);
        Task<TEntity> GetByKeyAsync(TKey key);
        Task<List<TEntity>> GetListAsync(TQueryParam queryParam, Expression<Func<TEntity, TEntity>>? selector = null);
        Task<TEntity> CreateAsync(TEntity entity);
    }
}
