using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Entities.Interfaces;
using DemoAuthWebBackend.Repository.QueryParams;
using DemoAuthWebBackend.Utils.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using X.PagedList;

namespace DemoAuthWebBackend.Repository._GenericRepo
{
    public abstract class GenericRepository<TKey, TEntity, TQueryParam> : IGenericRepository<TKey, TEntity, TQueryParam>
        where TKey : notnull
        where TEntity : class
        where TQueryParam : BaseQueryParams
    {
        protected readonly AppDbContext _appDbContext;

        public GenericRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public virtual TEntity GetByKey(TKey key)
        {
            return _appDbContext.Set<TEntity>().Find(key);
        }
        public  TEntity Create(TEntity entity)
        {
            _appDbContext.Set<TEntity>().Add(entity);
            return entity;
        }

        public virtual async Task<TEntity> GetByKeyAsync(TKey key)
        {
            return await _appDbContext.Set<TEntity>().FindAsync(key);
        }

        public virtual async Task<TEntity> CreateAsync(TEntity entity)
        {
            await _appDbContext.Set<TEntity>().AddAsync(entity);
            return entity;
        }

        public virtual void Delete(TEntity entity, bool forceHardDelete = false)
        {
            if (entity is ISoftDeletable softEntity && !forceHardDelete)
            {
                // Soft delete
                softEntity.FlagDel = FlagBoolean.TRUE;

                // Attach the entity as TEntity (safe cast)
                var entry = _appDbContext.Entry(entity);
                if (entry.State == EntityState.Detached)
                    _appDbContext.Set<TEntity>().Attach(entity);

                entry.Property(nameof(ISoftDeletable.FlagDel)).IsModified = true;
            }
            else
            {
                // Hard delete
                var entry = _appDbContext.Entry(entity);
                if (entry.State == EntityState.Detached)
                    _appDbContext.Set<TEntity>().Attach(entity);

                _appDbContext.Set<TEntity>().Remove(entity);
            }
        }

        public abstract TEntity Update(TEntity entity);

        public abstract List<TEntity> GetList(TQueryParam? queryParam = null, Expression<Func<TEntity, TEntity>>? selector = null);

        public abstract IPagedList<TEntity> GetPagedList(TQueryParam? queryParam = null, Expression<Func<TEntity, TEntity>>? selector = null);

        public abstract Task<List<TEntity>> GetListAsync(TQueryParam queryParam, Expression<Func<TEntity, TEntity>>? selector = null);
    }
}
