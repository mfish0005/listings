using System.Text.Json;
using Listings.Api.Infrastructure;
using Listings.Data.Context;
using Listings.Data.Seed;
using Listings.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
        options.InvalidModelStateResponseFactory = context => CreateBindingProblem(context.ModelState));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddDbContext<ListingsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddListingServices();
builder.Services.AddSingleton(
    builder.Configuration.GetSection(SeedOptions.SectionName).Get<SeedOptions>() ?? new SeedOptions());

var app = builder.Build();

await InitializeDatabaseAsync(app.Services);

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

static ObjectResult CreateBindingProblem(ModelStateDictionary modelState)
{
    var errors = modelState
        .Where(entry => entry.Value?.Errors.Count > 0)
        .ToDictionary(
            entry => JsonNamingPolicy.CamelCase.ConvertName(entry.Key),
            entry => entry.Value!.Errors.Select(error => error.ErrorMessage).ToArray());

    return ValidationProblemFactory.CreateResult(errors, "Invalid request");
}

static async Task InitializeDatabaseAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ListingsDbContext>();
    var seedOptions = scope.ServiceProvider.GetRequiredService<SeedOptions>();
    var today = DateOnly.FromDateTime(scope.ServiceProvider.GetRequiredService<TimeProvider>().GetLocalNow().DateTime);

    await context.Database.MigrateAsync();
    await ListingSeeder.SeedAsync(context, seedOptions, today);
}
