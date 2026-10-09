using Listings.Data.Entities;
using Listings.Data.Repositories;
using Listings.Tests.Helpers;

namespace Listings.Tests.Data;

public class ListingRepositoryTests
{
    private static async Task<string[]> Search(ListingFilter filter, params Listing[] listings)
    {
        await using var context = SearchHarness.CreateContext();
        context.Listings.AddRange(listings);
        await context.SaveChangesAsync();

        var found = await new ListingRepository(context).SearchAsync(filter);

        return found.Select(listing => listing.ExternalId).Order().ToArray();
    }

    [Fact]
    public async Task NoFilters_ReturnsEverything()
    {
        var ids = await Search(
            new ListingFilter(),
            ListingFactory.Create(externalId: "A1"),
            ListingFactory.Create(externalId: "A2"));

        Assert.Equal(["A1", "A2"], ids);
    }

    [Fact]
    public async Task City_MatchesIgnoringCaseAndSurroundingWhitespace()
    {
        var ids = await Search(
            new ListingFilter { City = "  springfield " },
            ListingFactory.Create(externalId: "A1", city: "Springfield"),
            ListingFactory.Create(externalId: "A2", city: "Fairfax"));

        Assert.Equal(["A1"], ids);
    }

    [Fact]
    public async Task City_MatchesTheStartOfTheName()
    {
        var ids = await Search(
            new ListingFilter { City = "Alex" },
            ListingFactory.Create(externalId: "A1", city: "Alexandria"),
            ListingFactory.Create(externalId: "A2", city: "Springfield"));

        Assert.Equal(["A1"], ids);
    }

    [Fact]
    public async Task City_MatchesAnyCityThatSharesThePrefix()
    {
        var ids = await Search(
            new ListingFilter { City = "Fa" },
            ListingFactory.Create(externalId: "A1", city: "Fairfax"),
            ListingFactory.Create(externalId: "A2", city: "Falls Church"),
            ListingFactory.Create(externalId: "A3", city: "Reston"));

        Assert.Equal(["A1", "A2"], ids);
    }

    [Fact]
    public async Task City_DoesNotMatchTheMiddleOfAName()
    {
        var ids = await Search(
            new ListingFilter { City = "field" },
            ListingFactory.Create(city: "Springfield"));

        Assert.Empty(ids);
    }

    [Theory]
    [InlineData("%")]
    [InlineData("_")]
    [InlineData("[a-z]")]
    public async Task City_TreatsWildcardCharactersLiterally(string city)
    {
        var ids = await Search(
            new ListingFilter { City = city },
            ListingFactory.Create(city: "Springfield"));

        Assert.Empty(ids);
    }

    [Fact]
    public async Task Keyword_MatchesDescriptionIgnoringCase()
    {
        var ids = await Search(
            new ListingFilter { Keyword = "PETS" },
            ListingFactory.Create(externalId: "A1", description: "Pets allowed."),
            ListingFactory.Create(externalId: "A2", description: "Quiet street."));

        Assert.Equal(["A1"], ids);
    }

    [Fact]
    public async Task Keyword_RequiresEveryWordInAnyOrder()
    {
        var ids = await Search(
            new ListingFilter { Keyword = "metro condo" },
            ListingFactory.Create(externalId: "A1", description: "Condo with easy access to the Metro."),
            ListingFactory.Create(externalId: "A2", description: "Quiet condo on a cul-de-sac."),
            ListingFactory.Create(externalId: "A3", description: "Walk to the Metro."));

        Assert.Equal(["A1"], ids);
    }

    [Fact]
    public async Task Keyword_IgnoresExtraWhitespaceAndRepeatedWords()
    {
        var ids = await Search(
            new ListingFilter { Keyword = "   pet    pet \t friendly  " },
            ListingFactory.Create(externalId: "A1", description: "Friendly neighbors. Pets welcome."),
            ListingFactory.Create(externalId: "A2", description: "Pets welcome."));

        Assert.Equal(["A1"], ids);
    }

    [Theory]
    [InlineData("%")]
    [InlineData("_")]
    public async Task Keyword_TreatsWildcardCharactersLiterally(string keyword)
    {
        var ids = await Search(
            new ListingFilter { Keyword = keyword },
            ListingFactory.Create(description: "Quiet street."));

        Assert.Empty(ids);
    }

    [Fact]
    public async Task Keyword_IgnoresOtherFields()
    {
        var ids = await Search(
            new ListingFilter { Keyword = "Oak" },
            ListingFactory.Create(address: "456 Oak Ave", description: "Updated kitchen."));

        Assert.Empty(ids);
    }

    [Fact]
    public async Task PriceBounds_AreInclusive()
    {
        var ids = await Search(
            new ListingFilter { MinPrice = 400_000, MaxPrice = 500_000 },
            ListingFactory.Create(externalId: "LOW", price: 399_999),
            ListingFactory.Create(externalId: "MIN", price: 400_000),
            ListingFactory.Create(externalId: "MAX", price: 500_000),
            ListingFactory.Create(externalId: "HIGH", price: 500_001));

        Assert.Equal(["MAX", "MIN"], ids);
    }

    [Fact]
    public async Task MinBedrooms_MeansAtLeast()
    {
        var ids = await Search(
            new ListingFilter { MinBedrooms = 3 },
            ListingFactory.Create(externalId: "TWO", bedrooms: 2),
            ListingFactory.Create(externalId: "THREE", bedrooms: 3),
            ListingFactory.Create(externalId: "FOUR", bedrooms: 4));

        Assert.Equal(["FOUR", "THREE"], ids);
    }

    [Fact]
    public async Task BlankFilters_AreIgnored()
    {
        var ids = await Search(
            new ListingFilter { City = "   ", Keyword = "" },
            ListingFactory.Create(externalId: "A1"),
            ListingFactory.Create(externalId: "A2"));

        Assert.Equal(["A1", "A2"], ids);
    }

    [Fact]
    public async Task Filters_AreCombined()
    {
        var ids = await Search(
            new ListingFilter { City = "Springfield", MinBedrooms = 3, MaxPrice = 500_000, Keyword = "yard" },
            ListingFactory.Create(externalId: "MATCH", bedrooms: 3, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "WRONG_CITY", city: "Fairfax", bedrooms: 3, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "TOO_SMALL", bedrooms: 2, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "TOO_PRICEY", bedrooms: 3, price: 520_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "NO_YARD", bedrooms: 3, price: 480_000, description: "Top floor."));

        Assert.Equal(["MATCH"], ids);
    }

    [Fact]
    public async Task Search_DoesNotTrackTheListingsItReturns()
    {
        await using var context = SearchHarness.CreateContext();
        context.Listings.Add(ListingFactory.Create());
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        await new ListingRepository(context).SearchAsync(new ListingFilter());

        Assert.Empty(context.ChangeTracker.Entries());
    }
}
