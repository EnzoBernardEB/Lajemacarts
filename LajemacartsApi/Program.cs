using GalleryContext.BusinessLogic.Gateways.Providers;
using GalleryContext.BusinessLogic.Gateways.Repositories;
using GalleryContext.BusinessLogic.UseCases.AddArtwork;
using GalleryContext.BusinessLogic.UseCases.DeleteArtwork;
using GalleryContext.BusinessLogic.UseCases.GetAllArtworks;
using GalleryContext.BusinessLogic.UseCases.UpdateArtwork;
using GalleryContext.SecondaryAdapters.Providers;
using GalleryContext.SecondaryAdapters.Repositories.EntityFramework;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
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

builder.Services.AddScoped<IArtworkRepository, EfArtworkRepository>();

builder.Services.AddSingleton<IDateTimeProvider, SystemeDateTimeProvider>();
builder.Services.AddScoped<AddArtworkUseCase>();
builder.Services.AddScoped<UpdateArtworkUseCase>();
builder.Services.AddScoped<GetAllArtworksUseCase>();
builder.Services.AddScoped<DeleteArtworkUseCase>();

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
var connectionString = builder.Configuration.GetConnectionString("DATABASE_CONNECTION_STRING") 
                       ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");

if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("GalleryConnectionLocalDatabase");
}

builder.Services.AddDbContext<ArtworkDbContext>(options => options.UseNpgsql(connectionString)
);
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI(options =>
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Lajemacarts API v1");
    options.RoutePrefix = string.Empty;
  });
}
else
{
  app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(myAllowSpecificOrigins);

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ArtworkDbContext>();
    dbContext.Database.Migrate();
}

app.Run();

public partial class Program { };