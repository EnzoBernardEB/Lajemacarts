using System.Reflection;
using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.SecondaryAdapters.Providers;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
  .PartManager.ApplicationParts.Add(new AssemblyPart(Assembly.Load("GalleryContext.PrimaryAdapters")));

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
  options.AddPolicy(myAllowSpecificOrigins,
      policy =>
      {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
      });
});

// var connectionString = builder.Configuration.GetConnectionString("GalleryConnection");
// if (string.IsNullOrEmpty(connectionString))
// {
//   throw new InvalidOperationException("Connection string 'GalleryConnection' not found.");
// }
// builder.Services.AddDbContext<ArtworkDbContext>(options =>
//     options.UseNpgsql(connectionString));

builder.Services.AddScoped<IArtworkRepository, EfArtworkRepository>();

builder.Services.AddSingleton<IDateTimeProvider, SystemeDateTimeProvider>();
builder.Services.AddScoped<AddArtworkUseCase>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
  options.SwaggerDoc("v1", new OpenApiInfo
  {
    Version = "v1",
    Title = "Lajemacarts API",
    Description = "API pour la gestion d'oeuvres d'art (Lajemacarts)",
  });
});

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI(options =>
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Lajemacarts API v1");
    options.RoutePrefix = string.Empty;
  });

  try
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
    Console.WriteLine("Applying database migrations...");
    dbContext.Database.Migrate();
    Console.WriteLine("Database migrations applied successfully.");
  }
  catch (Exception ex)
  {
    Console.Error.WriteLine($"An error occurred while migrating the database: {ex.Message}");
  }
}
else
{
  app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(myAllowSpecificOrigins);

// 6. Authentification et Autorisation (décommenter si/quand configuré)
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { };