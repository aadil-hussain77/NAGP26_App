using NAGP26_App.Models;

namespace NAGP26_App.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Employees.Any()) return;

            var employees = new List<Employee>
            {
                new Employee { EmployeeCode = "E001", FirstName = "John", LastName = "Doe", Email = "john.doe@example.com", ContactNo = "1234567890", Department = "HR", Designation = "Manager", IsActive = true },
                new Employee { EmployeeCode = "E002", FirstName = "Jane", LastName = "Smith", Email = "jane.smith@example.com", ContactNo = "1234567891", Department = "IT", Designation = "Developer", IsActive = true },
                new Employee { EmployeeCode = "E003", FirstName = "Bob", LastName = "Brown", Email = "bob.brown@example.com", ContactNo = "1234567892", Department = "Finance", Designation = "Accountant", IsActive = true },
                new Employee { EmployeeCode = "E004", FirstName = "Alice", LastName = "Green", Email = "alice.green@example.com", ContactNo = "1234567893", Department = "Marketing", Designation = "Executive", IsActive = true },
                new Employee { EmployeeCode = "E005", FirstName = "Tom", LastName = "White", Email = "tom.white@example.com", ContactNo = "1234567894", Department = "IT", Designation = "DevOps", IsActive = true }
            };

            context.Employees.AddRange(employees);
            context.SaveChanges();
        }
    }
}