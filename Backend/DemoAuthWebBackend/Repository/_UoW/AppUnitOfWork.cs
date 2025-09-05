using DemoAuthWebBackend.Context;
using DemoAuthWebBackend.Repository.ProductRepository;
using Microsoft.EntityFrameworkCore.Storage;

namespace DemoAuthWebBackend.Repository._UoW
{
    public class AppUnitOfWork : IAppUnitOfWork
    {
        // Store an active transaction
        private IDbContextTransaction? _transaction;
        private readonly AppDbContext _appDbContext;
        public IProductRepository Products { get; }

        public AppUnitOfWork(AppDbContext context, IProductRepository products)
        {
            _appDbContext = context;
            Products = products;
        }

        public IDbContextTransaction BeginTransaction()
        {
            if (_transaction == null)
                _transaction = _appDbContext.Database.BeginTransaction();

            return _transaction;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null)
                _transaction = await _appDbContext.Database.BeginTransactionAsync(cancellationToken);

            return _transaction;
        }

        public void CommitTransaction()
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");

            _transaction.Commit();
            _transaction.Dispose();
            _transaction = null;
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");

            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _appDbContext.Dispose();
        }

        public async ValueTask DisposeAsync()
        {
            if (_transaction != null)
                await _transaction.DisposeAsync();

            await _appDbContext.DisposeAsync();
        }

        public void RollbackTransaction()
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");

            _transaction.Rollback();
            _transaction.Dispose();
            _transaction = null;
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");

            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        public int SaveChanges()
        {
            return _appDbContext.SaveChanges();
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _appDbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
