using DemoAuthWebBackend.Entities;
using Microsoft.EntityFrameworkCore;

namespace DemoAuthWebBackend.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
