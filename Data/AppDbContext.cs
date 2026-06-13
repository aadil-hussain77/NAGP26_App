using Microsoft.EntityFrameworkCore;
using NAGP26_App.Models;

namespace NAGP26_App.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employee>(b =>
            {
                b.HasKey(e => e.EmployeeId);
                b.HasIndex(e => e.Department).HasDatabaseName("IX_Employee_Department");
                b.HasIndex(e => e.IsActive).HasDatabaseName("IX_Employee_IsActive");
                b.HasIndex(e => e.EmployeeCode).IsUnique();
                b.HasIndex(e => e.Email).IsUnique();

                b.Property(e => e.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
                b.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            });
        }
    }
}