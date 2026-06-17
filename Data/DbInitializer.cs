using NAGP26_App.Models;

namespace NAGP26_App.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // In Kubernetes/Production, the DB + schema + seed are created by the init job.
            // Avoid requiring elevated permissions (e.g. CREATE DATABASE) from the app login.
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.Equals("Production", StringComparison.OrdinalIgnoreCase) == true)
            {
                return;
            }

            context.Database.EnsureCreated();
        }
    }
}