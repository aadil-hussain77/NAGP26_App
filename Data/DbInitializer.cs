using NAGP26_App.Models;

namespace NAGP26_App.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Ensure database and schema are created. Do not insert default records.
            context.Database.EnsureCreated();

            // No initial seed - application will show empty state and allow user to create employees.
        }
    }
}