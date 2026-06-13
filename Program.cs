using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Configuration: connection string should come from environment in container/K8s
var configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DefaultConnection")
                       ?? "Server=(localdb)\\mssqllocaldb;Database=NAGP26_DB;Trusted_Connection=True;MultipleActiveResultSets=true";

// Add services to the container.
builder.Services.AddRazorPages();

// EF Core with SQL Server and DbContext pooling for best performance
builder.Services.AddDbContextPool<NAGP26_App.Data.AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<NAGP26_App.Data.AppDbContext>();
    NAGP26_App.Data.DbInitializer.Initialize(db);
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

// Swagger for API exploration (enable in non-production as needed)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Minimal APIs for Employee CRUD
app.MapGet("/api/employees", async (NAGP26_App.Data.AppDbContext db) =>
{
    return Results.Ok(await db.Employees.AsNoTracking().ToListAsync());
});

app.MapGet("/api/employees/{id:long}", async (long id, NAGP26_App.Data.AppDbContext db) =>
{
    var emp = await db.Employees.FindAsync(id);
    return emp is null ? Results.NotFound() : Results.Ok(emp);
});

app.MapPost("/api/employees", async (NAGP26_App.Models.Employee employee, NAGP26_App.Data.AppDbContext db) =>
{
    employee.CreatedAt = DateTime.UtcNow;
    employee.UpdatedAt = DateTime.UtcNow;
    db.Employees.Add(employee);
    await db.SaveChangesAsync();
    return Results.Created($"/api/employees/{employee.EmployeeId}", employee);
});

app.MapPut("/api/employees/{id:long}", async (long id, NAGP26_App.Models.Employee incoming, NAGP26_App.Data.AppDbContext db) =>
{
    var existing = await db.Employees.FindAsync(id);
    if (existing is null) return Results.NotFound();

    // Basic concurrency handling using RowVersion
    existing.EmployeeCode = incoming.EmployeeCode;
    existing.FirstName = incoming.FirstName;
    existing.LastName = incoming.LastName;
    existing.Email = incoming.Email;
    existing.ContactNo = incoming.ContactNo;
    existing.Department = incoming.Department;
    existing.Designation = incoming.Designation;
    existing.IsActive = incoming.IsActive;
    existing.UpdatedAt = DateTime.UtcNow;

    try
    {
        await db.SaveChangesAsync();
    }
    catch (DbUpdateConcurrencyException)
    {
        return Results.Conflict();
    }

    return Results.NoContent();
});

app.MapDelete("/api/employees/{id:long}", async (long id, NAGP26_App.Data.AppDbContext db) =>
{
    var existing = await db.Employees.FindAsync(id);
    if (existing is null) return Results.NotFound();
    db.Employees.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Map SPA page
app.MapRazorPages();

app.Run();
