using Listings.Data.Seed;
using Listings.Services.Models;
using Listings.Tests.Helpers;

namespace Listings.Tests.Search;

public class ListingSearchDuplicatesTests
{
    private static string[] ExternalIds(PagedResult<ListingResult> page) =>
        page.Results.Select(result => result.ExternalId).ToArray();

    [Fact]
    public async Task TheSameHomeFromTwoFeeds_IsOneResult()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "123 Main St, Apt 4B"),
            ListingFactory.Create(source: "MLS_B", externalId: "B7", address: "123 Main Street, Unit 4B"));

        Assert.Equal(1, page.TotalCount);
        Assert.Single(page.Results);
    }

    [Fact]
    public async Task TheBestScoringListing_RepresentsTheHome_AndTheOtherIsListedAlongside()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "123 Main St", listedDate: "2026-09-01", price: 450_000),
            ListingFactory.Create(source: "MLS_B", externalId: "B7", address: "123 Main Street", listedDate: "2026-09-20", price: 452_000));

        var result = Assert.Single(page.Results);
        Assert.Equal("B7", result.ExternalId);
        var other = Assert.Single(result.AlsoListedBy);
        Assert.Equal("A1", other.ExternalId);
        Assert.Equal("MLS_A", other.Source);
        Assert.Equal(450_000m, other.Price);
        Assert.Equal(new DateOnly(2026, 9, 1), other.ListedDate);
    }

    [Fact]
    public async Task TheRepresentativeFollowsTheTargetBudget()
    {
        var cheaperOlder = ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "123 Main St", price: 450_000, listedDate: "2026-09-05");
        var dearerNewer = ListingFactory.Create(source: "MLS_B", externalId: "B7", address: "123 Main Street", price: 520_000, listedDate: "2026-09-25");

        var budgetFitsCheaper = await SearchHarness.Search(new ListingSearchQuery { TargetBudget = 450_000 }, cheaperOlder, dearerNewer);
        var budgetFitsBoth = await SearchHarness.Search(new ListingSearchQuery { TargetBudget = 600_000 }, cheaperOlder, dearerNewer);

        Assert.Equal(["A1"], ExternalIds(budgetFitsCheaper));
        Assert.Equal(["B7"], ExternalIds(budgetFitsBoth));
    }

    [Fact]
    public async Task WithoutABudget_TheNewerListingRepresentsTheHome()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "55 Elm Ct", listedDate: "2026-09-04"),
            ListingFactory.Create(source: "MLS_B", externalId: "B11", address: "55 Elm Court", listedDate: "2026-08-15"));

        Assert.Equal(["A1"], ExternalIds(page));
    }

    [Fact]
    public async Task ADifferingZip_DoesNotStopTwoListingsFromMatching()
    {
        var first = ListingFactory.Create(source: "MLS_A", externalId: "A2", address: "456 Oak Ave");
        var second = ListingFactory.Create(source: "MLS_B", externalId: "B8", address: "456 Oak Avenue");
        second.Zip = "22151";

        var page = await SearchHarness.Search(new ListingSearchQuery(), first, second);

        Assert.Equal(1, page.TotalCount);
    }

    [Fact]
    public async Task AHomeListedByThreeFeeds_ListsTheOtherTwoInRankOrder()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "9 Oak Ln", listedDate: "2026-09-01"),
            ListingFactory.Create(source: "MLS_B", externalId: "B1", address: "9 Oak Lane", listedDate: "2026-09-25"),
            ListingFactory.Create(source: "MLS_C", externalId: "C1", address: "9 oak ln.", listedDate: "2026-09-10"));

        var result = Assert.Single(page.Results);
        Assert.Equal("B1", result.ExternalId);
        Assert.Equal(["C1", "A1"], result.AlsoListedBy.Select(other => other.ExternalId));
    }

    [Fact]
    public async Task ListingsThatAreNotDuplicates_HaveNothingListedAlongside()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(externalId: "A1", address: "1 Oak St"),
            ListingFactory.Create(externalId: "A2", address: "2 Oak St"));

        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Results, result => Assert.Empty(result.AlsoListedBy));
    }

    [Fact]
    public async Task DifferentUnitsInOneBuilding_AreKeptApart()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(externalId: "A1", address: "123 Main St, Apt 4B"),
            ListingFactory.Create(externalId: "A2", address: "123 Main St, Apt 5C"));

        Assert.Equal(2, page.TotalCount);
    }

    [Fact]
    public async Task TheSameAddressInTwoCities_IsKeptApart()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery(),
            ListingFactory.Create(externalId: "A1", address: "123 Main St", city: "Springfield"),
            ListingFactory.Create(externalId: "A2", address: "123 Main St", city: "Fairfax"));

        Assert.Equal(2, page.TotalCount);
    }

    [Fact]
    public async Task IncludeDuplicates_ReturnsEveryListing_WithNothingListedAlongside()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery { IncludeDuplicates = true },
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "123 Main St"),
            ListingFactory.Create(source: "MLS_B", externalId: "B7", address: "123 Main Street"));

        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Results, result => Assert.Empty(result.AlsoListedBy));
    }

    [Fact]
    public async Task Filters_ApplyBeforeDuplicatesAreCollapsed()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery { MinPrice = 451_000 },
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "123 Main St", price: 450_000),
            ListingFactory.Create(source: "MLS_B", externalId: "B7", address: "123 Main Street", price: 452_000));

        var result = Assert.Single(page.Results);
        Assert.Equal("B7", result.ExternalId);
        Assert.Empty(result.AlsoListedBy);
    }

    [Fact]
    public async Task Paging_CountsHomes_NotListings()
    {
        var listings = Enumerable.Range(1, 5)
            .SelectMany(home => new[]
            {
                ListingFactory.Create(source: "MLS_A", externalId: $"A{home}", address: $"{home} Oak St"),
                ListingFactory.Create(source: "MLS_B", externalId: $"B{home}", address: $"{home} Oak Street")
            })
            .ToArray();

        var page = await SearchHarness.Search(new ListingSearchQuery { PageSize = 2, Page = 3 }, listings);

        Assert.Equal(5, page.TotalCount);
        Assert.Equal(3, page.TotalPages);
        Assert.Single(page.Results);
    }

    [Fact]
    public async Task AHome_TakesThePlaceOfItsBestListing_InTheRanking()
    {
        var page = await SearchHarness.Search(
            new ListingSearchQuery { TargetBudget = 500_000 },
            ListingFactory.Create(source: "MLS_A", externalId: "A1", address: "1 Oak St", price: 500_000, listedDate: "2026-10-01"),
            ListingFactory.Create(source: "MLS_A", externalId: "A2", address: "2 Oak St", price: 700_000, listedDate: "2026-10-04"),
            ListingFactory.Create(source: "MLS_B", externalId: "B2", address: "2 Oak Street", price: 500_000, listedDate: "2026-10-04"));

        Assert.Equal(["B2", "A1"], ExternalIds(page));
    }

    [Fact]
    public async Task TheSampleFeed_HasEightHomes_InTwelveListings()
    {
        await using var context = SearchHarness.CreateContext();
        await ListingSeeder.SeedAsync(context, new SeedOptions { DemoListings = 0 }, TestClock.Today);

        var collapsed = await SearchHarness.SearchAsync(context, new ListingSearchQuery { PageSize = 100 });
        var everything = await SearchHarness.SearchAsync(context, new ListingSearchQuery { PageSize = 100, IncludeDuplicates = true });

        Assert.Equal(8, collapsed.TotalCount);
        Assert.Equal(12, everything.TotalCount);
        Assert.Equal(4, collapsed.Results.Count(result => result.AlsoListedBy.Count == 1));
    }

    [Fact]
    public async Task TheDemoData_AddsNoDuplicatesOfItsOwnOrOfTheSampleFeed()
    {
        await using var context = SearchHarness.CreateContext();
        await ListingSeeder.SeedAsync(context, new SeedOptions { DemoListings = 300 }, TestClock.Today);

        var collapsed = await SearchHarness.SearchAsync(context, new ListingSearchQuery { PageSize = 100 });
        var everything = await SearchHarness.SearchAsync(context, new ListingSearchQuery { PageSize = 100, IncludeDuplicates = true });

        Assert.Equal(everything.TotalCount - 4, collapsed.TotalCount);
    }
}
