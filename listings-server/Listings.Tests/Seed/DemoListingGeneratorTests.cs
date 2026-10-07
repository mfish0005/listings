using Listings.Data.Seed;
using Listings.Tests.Helpers;

namespace Listings.Tests.Seed;

public class DemoListingGeneratorTests
{
    private const int LessonListingCount = 7 + 6 + 4;
    private static readonly string[] LessonCities =
        [DemoListingGenerator.PriceLessonCity, DemoListingGenerator.AgeLessonCity, DemoListingGenerator.MixLessonCity];

    [Fact]
    public void Generate_ReturnsLessonListingsPlusRequestedFiller()
    {
        var listings = DemoListingGenerator.Generate(100, TestClock.Today);

        Assert.Equal(LessonListingCount + 100, listings.Count);
    }

    [Fact]
    public void Generate_WithNoFiller_ReturnsOnlyLessonListings()
    {
        var listings = DemoListingGenerator.Generate(0, TestClock.Today);

        Assert.Equal(LessonListingCount, listings.Count);
        Assert.All(listings, listing => Assert.Contains(listing.City, LessonCities));
    }

    [Fact]
    public void Generate_IsDeterministic()
    {
        var first = DemoListingGenerator.Generate(50, TestClock.Today);
        var second = DemoListingGenerator.Generate(50, TestClock.Today);

        Assert.Equal(Describe(first), Describe(second));
    }

    [Fact]
    public void Generate_ProducesUniqueSourceAndExternalIdPairs()
    {
        var listings = DemoListingGenerator.Generate(300, TestClock.Today);

        var distinctKeys = listings.Select(l => (l.Source, l.ExternalId)).Distinct().Count();

        Assert.Equal(listings.Count, distinctKeys);
    }

    [Fact]
    public void Generate_PrefixesEveryExternalIdSoDemoRowsAreIdentifiable()
    {
        var listings = DemoListingGenerator.Generate(20, TestClock.Today);

        Assert.All(listings, listing => Assert.StartsWith(DemoListingGenerator.ExternalIdPrefix, listing.ExternalId));
    }

    [Fact]
    public void Generate_FillerKeepsLessonCitiesIsolated()
    {
        var filler = DemoListingGenerator.Generate(300, TestClock.Today)
            .Where(listing => !LessonCities.Contains(listing.City));

        Assert.Equal(300, filler.Count());
    }

    [Fact]
    public void Generate_SpreadsFillerAcrossCitiesWithEnoughListingsToPage()
    {
        var citiesWithMoreThanOnePage = DemoListingGenerator.Generate(300, TestClock.Today)
            .Where(listing => !LessonCities.Contains(listing.City))
            .GroupBy(listing => listing.City)
            .Count(group => group.Count() > 5);

        Assert.True(citiesWithMoreThanOnePage >= 10);
    }

    [Fact]
    public void Generate_FillerListingsAreNeverDatedInTheFuture()
    {
        var listings = DemoListingGenerator.Generate(300, TestClock.Today);

        Assert.All(listings, listing => Assert.True(listing.ListedDate <= TestClock.Today));
    }

    private static string[] Describe(IEnumerable<Listings.Data.Entities.Listing> listings) =>
        listings
            .Select(l => $"{l.Source}|{l.ExternalId}|{l.Address}|{l.City}|{l.Price}|{l.Bedrooms}|{l.ListedDate}|{l.Description}")
            .ToArray();
}
