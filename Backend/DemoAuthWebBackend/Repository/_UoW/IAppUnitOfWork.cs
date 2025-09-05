using DemoAuthWebBackend.Repository.ProductRepository;
using Microsoft.EntityFrameworkCore.Storage;

namespace DemoAuthWebBackend.Repository._UoW
{
    public interface IAppUnitOfWork : IDisposable, IAsyncDisposable
    {
        // Repositories
        IProductRepository Products { get; }

        // Save changes
        int SaveChanges();
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        // Transactions (synchronous)
        IDbContextTransaction BeginTransaction();
        void CommitTransaction();
        void RollbackTransaction();

        // Transactions (asynchronous)
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    }
}
