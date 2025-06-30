using System.Reflection;
using Npgsql;
using Testcontainers.PostgreSql;

namespace SharedKernel.DatabaseTests.fixture;

public class PgTestContainerRunner
{
    private PostgreSqlContainer Container { get; } = new PostgreSqlBuilder()
        .WithDatabase("lajemacarts")
        .WithUsername("lajemacarts")
        .WithPassword("password")
        .Build();

    public string ConnectionString()
    {
        return Container.GetConnectionString();
    }

    public async Task Init()
    {
        await Container.StartAsync();
        await WaitForConnectionAsync();
        await RunDdlScriptToDatabase();
    }

    public async Task Down()
    {
        await Container.DisposeAsync();
    }

    private async Task RunDdlScriptToDatabase()
    {
        await using var stream = await LoadDdlSqlFile();
        using var reader = new StreamReader(stream ?? throw new InvalidOperationException());  
        var sql = await reader.ReadToEndAsync();
        await using var connection = new NpgsqlConnection(Container.GetConnectionString());
        connection.Open();
        await using var command = new NpgsqlCommand(sql, connection);
        await Task.Run(() => command.ExecuteNonQuery());
    }

private async Task WaitForConnectionAsync()
            {
                var maxRetries = 10;
                var delay = TimeSpan.FromSeconds(2);
                for (int i = 0; i < maxRetries; i++)
                {
                    try
                    {
                        await using var connection = new NpgsqlConnection(Container.GetConnectionString());
                        await connection.OpenAsync();
                        return;
                    }
                    catch
                    {
                        await Task.Delay(delay);
                    }
                }
                throw new Exception("Unable to connect to database");
            }

    private static Task<Stream?> LoadDdlSqlFile()
    {
        const string resourceName = "GalleryContext.SecondaryAdapters.Resources.lajemacarts-db-ddl.sql";
        var assembly = Assembly.LoadFrom("GalleryContext.SecondaryAdapters.dll");
        return Task.FromResult(assembly.GetManifestResourceStream(resourceName));
    }
}
