using Listings.Data.Repositories;
using Listings.Services.Catalog;
using Listings.Services.Scoring;
using Listings.Services.Search;
using Microsoft.Extensions.DependencyInjection;

namespace Listings.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddListingServices(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton(new ScoringOptions());
        services.AddSingleton<ListingScorer>();
        services.AddSingleton<ListingQueryValidator>();
        services.AddScoped<IListingRepository, ListingRepository>();
        services.AddScoped<IListingSearchService, ListingSearchService>();
        services.AddSingleton<ListingInputValidator>();
        services.AddScoped<IListingService, ListingService>();

        return services;
    }
}
