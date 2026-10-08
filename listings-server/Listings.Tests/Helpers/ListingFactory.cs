using Listings.Data.Entities;

namespace Listings.Tests.Helpers;

public static class ListingFactory
{
    public static Listing Create(
        string source = "MLS_A",
        string externalId = "A1",
        string? address = null,
        string city = "Springfield",
        decimal price = 450_000,
        int bedrooms = 2,
        string listedDate = "2026-09-29",
        string description = "Bright condo near shops.",
        string status = "active") => new()
    {
        Source = source,
        ExternalId = externalId,
        Address = address ?? $"{externalId} Main St",
        City = city,
        State = "VA",
        Zip = "22150",
        Price = price,
        Bedrooms = bedrooms,
        Bathrooms = 1.5m,
        Sqft = 1000,
        Latitude = 38.78,
        Longitude = -77.18,
        ListedDate = DateOnly.Parse(listedDate),
        Status = status,
        Description = description
    };
}
