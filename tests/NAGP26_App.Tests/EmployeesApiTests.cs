

namespace NAGP26_App.Tests;

public class EmployeesApiTests //: IClassFixture<WebApplicationFactory<Program>>
{
    //    private readonly WebApplicationFactory<Program> _factory;

    //    public EmployeesApiTests(WebApplicationFactory<Program> factory)
    //    {
    //        _factory = factory;
    //    }

    //    [Fact]
    //    public async Task GetEmployees_ReturnsOk()
    //    {
    //        var client = _factory.CreateClient();
    //        var res = await client.GetAsync("/api/employees");
    //        res.StatusCode.Should().Be(HttpStatusCode.OK);
    //    }

    //    [Fact]
    //    public async Task CreateAndDeleteEmployee_Works()
    //    {
    //        var client = _factory.CreateClient();
    //        var emp = new Employee
    //        {
    //            EmployeeCode = "T001",
    //            FirstName = "Test",
    //            LastName = "User",
    //            Email = "test.user@example.com",
    //            ContactNo = "0000000000",
    //            Department = "QA",
    //            Designation = "Tester",
    //            IsActive = true
    //        };

    //        var post = await client.PostAsJsonAsync("/api/employees", emp);
    //        post.StatusCode.Should().Be(HttpStatusCode.Created);
    //        var created = await post.Content.ReadFromJsonAsync<Employee>();
    //        created.Should().NotBeNull();

    //        var del = await client.DeleteAsync($"/api/employees/{created.EmployeeId}");
    //        del.StatusCode.Should().Be(HttpStatusCode.NoContent);
    //    }
}
