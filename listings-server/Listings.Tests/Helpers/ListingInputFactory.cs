using Listings.Services.Models;

namespace Listings.Tests.Helpers;

public static class ListingInputFactory
{
    public static ListingInput Valid() => new()
    {
        Address = "12 Test Lane",
        City = "Springfield",
        State = "VA",
        Zip = "22150",
        Price = 450_000m,
        Bedrooms = 3,
        Bathrooms = 2.5m,
        Sqft = 1800,
        Latitude = 38.78,
        Longitude = -77.18,
        ListedDate = TestClock.Today,
        Status = "active",
        Description = "A bright, freshly painted home."
    };
}
