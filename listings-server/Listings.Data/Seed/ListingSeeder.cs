using System.Reflection;
using System.Text.Json;
using Listings.Data.Context;
using Listings.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Listings.Data.Seed;

public static class ListingSeeder
{
    private const string ResourceName = "Listings.Data.Seed.sample_listings.json";

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public static async Task SeedAsync(ListingsDbContext context, SeedOptions options, DateOnly today)
    {
        await SeedSampleListingsAsync(context);
        await SyncDemoListingsAsync(context, Math.Max(0, options.DemoListings), today);
    }

    private static async Task SeedSampleListingsAsync(ListingsDbContext context)
    {
        if (await context.Listings.AnyAsync())
        {
            return;
        }

        context.Listings.AddRange(ReadSampleListings());
        await context.SaveChangesAsync();
    }

    // The demo set is replaced only when its size changes, so a restart never touches rows you added.
    private static async Task SyncDemoListingsAsync(ListingsDbContext context, int fillerCount, DateOnly today)
    {
        var existing = await context.Listings
            .Where(listing => listing.ExternalId.StartsWith(DemoListingGenerator.ExternalIdPrefix))
            .ToListAsync();

        var wanted = fillerCount > 0 ? DemoListingGenerator.Generate(fillerCount, today) : [];

        if (existing.Count == wanted.Count)
        {
            return;
        }

        context.Listings.RemoveRange(existing);
        context.Listings.AddRange(wanted);
        await context.SaveChangesAsync();
    }

    private static List<Listing> ReadSampleListings()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Embedded resource '{ResourceName}' was not found.");

        var feedListings = JsonSerializer.Deserialize<List<FeedListing>>(stream, JsonOptions)
            ?? throw new InvalidOperationException("Sample listings file was empty.");

        return feedListings.Select(ToEntity).ToList();
    }

    private static Listing ToEntity(FeedListing feed) => new()
    {
        Source = feed.Source,
        ExternalId = feed.Id,
        Address = feed.Address,
        City = feed.City,
        State = feed.State,
        Zip = feed.Zip,
        Price = feed.Price,
        Bedrooms = feed.Bedrooms,
        Bathrooms = feed.Bathrooms,
        Sqft = feed.Sqft,
        Latitude = feed.Latitude,
        Longitude = feed.Longitude,
        ListedDate = feed.ListedDate,
        Status = feed.Status,
        Description = feed.Description
    };

    private record FeedListing(
        string Id,
        string Source,
        string Address,
        string City,
        string State,
        string Zip,
        decimal Price,
        int Bedrooms,
        decimal Bathrooms,
        int Sqft,
        double Latitude,
        double Longitude,
        DateOnly ListedDate,
        string Status,
        string Description);
}
