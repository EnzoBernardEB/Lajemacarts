using Microsoft.EntityFrameworkCore;
using Xunit;

namespace SharedKernel.DatabaseTests.fixture;

public abstract class DatabaseTestFixture : IAsyncLifetime
{
    private readonly PgTestContainerRunner _container = new();

    public async Task InitializeAsync()
    {
        await _container.Init();
        ConfigureDbContext();
    }

    public Task DisposeAsync()
    {
        return _container.Down();
    }

    public string ConnectionString()
    {
        return _container.ConnectionString();
    }

    public abstract DbContext ConfigureDbContext();

    public abstract void ResetDatabase();
}