using Listings.Data.Context;
using Listings.Data.Entities;
using Listings.Services.Models;
using Listings.Services.Scoring;
using Listings.Services.Search;
using Listings.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Listings.Tests.Search;

public class ListingSearchServiceTests
{
    private static Task<PagedResult<ListingResult>> Search(ListingSearchQuery query, params Listing[] listings) =>
        SearchHarness.Search(query, listings);

    private static string[] ExternalIds(PagedResult<ListingResult> page) =>
        page.Results.Select(result => result.ExternalId).ToArray();

    private static Listing[] ManyListings(int count) =>
        Enumerable.Range(1, count)
            .Select(i => ListingFactory.Create(externalId: $"A{i:D2}", price: 400_000 + i * 1_000, listedDate: $"2026-09-{i:D2}"))
            .ToArray();

    [Fact]
    public async Task NoFilters_ReturnsEverything_WithPagingMetadata()
    {
        var page = await Search(new ListingSearchQuery(), ManyListings(12));

        Assert.Equal(12, page.TotalCount);
        Assert.Equal(3, page.TotalPages);
        Assert.Equal(1, page.Page);
        Assert.Equal(ListingSearchLimits.DefaultPageSize, page.PageSize);
        Assert.Equal(ListingSearchLimits.DefaultPageSize, page.Results.Count);
    }

    [Fact]
    public async Task FiltersFromTheQuery_ReachTheRepository()
    {
        var page = await Search(
            new ListingSearchQuery { City = "Springfield", MinBedrooms = 3, MaxPrice = 500_000, Keyword = "yard" },
            ListingFactory.Create(externalId: "MATCH", bedrooms: 3, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "WRONG_CITY", city: "Fairfax", bedrooms: 3, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "TOO_SMALL", bedrooms: 2, price: 480_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "TOO_PRICEY", bedrooms: 3, price: 520_000, description: "Fenced yard."),
            ListingFactory.Create(externalId: "NO_YARD", bedrooms: 3, price: 480_000, description: "Top floor."));

        Assert.Equal(["MATCH"], ExternalIds(page));
    }

    [Fact]
    public async Task NoMatches_ReturnsAnEmptyPage_NotAnError()
    {
        var page = await Search(
            new ListingSearchQuery { City = "Atlantis" },
            ManyListings(3));

        Assert.Empty(page.Results);
        Assert.Equal(0, page.TotalCount);
        Assert.Equal(0, page.TotalPages);
    }

    [Fact]
    public async Task WithoutBudget_NewestListingsComeFirst()
    {
        var page = await Search(
            new ListingSearchQuery(),
            ListingFactory.Create(externalId: "OLD", listedDate: "2026-07-01"),
            ListingFactory.Create(externalId: "NEW", listedDate: "2026-10-01"),
            ListingFactory.Create(externalId: "MID", listedDate: "2026-09-01"));

        Assert.Equal(["NEW", "MID", "OLD"], ExternalIds(page));
    }

    [Fact]
    public async Task WithBudget_AtOrUnderBudgetComesBeforeOverBudget_WhenListedOnTheSameDay()
    {
        var page = await Search(
            new ListingSearchQuery { TargetBudget = 500_000 },
            ListingFactory.Create(externalId: "OVER", price: 600_000),
            ListingFactory.Create(externalId: "UNDER", price: 400_000),
            ListingFactory.Create(externalId: "EXACT", price: 500_000));

        Assert.Equal(["UNDER", "EXACT", "OVER"], ExternalIds(page));
    }

    [Fact]
    public async Task WithBudget_RelevanceScoreIsReturnedOnEachResult()
    {
        var page = await Search(
            new ListingSearchQuery { TargetBudget = 500_000 },
            ListingFactory.Create(price: 500_000, listedDate: "2026-10-05"));

        var result = Assert.Single(page.Results);
        Assert.Equal(1.0, result.RelevanceScore, 4);
        Assert.Equal(1.0, result.BudgetFit!.Value, 4);
    }

    [Fact]
    public async Task TiedScores_AreOrderedBySourceThenExternalId_RegardlessOfInsertionOrder()
    {
        var a1 = ListingFactory.Create(source: "MLS_A", externalId: "A1");
        var b7 = ListingFactory.Create(source: "MLS_B", externalId: "B7");
        var a2 = ListingFactory.Create(source: "MLS_A", externalId: "A2");

        var forward = await Search(new ListingSearchQuery { TargetBudget = 450_000 }, a1, b7, a2);
        var reversed = await Search(new ListingSearchQuery { TargetBudget = 450_000 }, a2, b7, a1);

        Assert.Equal(["A1", "A2", "B7"], ExternalIds(forward));
        Assert.Equal(ExternalIds(forward), ExternalIds(reversed));
    }

    [Fact]
    public async Task FirstPage_ReturnsPageSizeItems()
    {
        var page = await Search(new ListingSearchQuery { Page = 1, PageSize = 5 }, ManyListings(12));

        Assert.Equal(5, page.Results.Count);
        Assert.Equal(1, page.Page);
    }

    [Fact]
    public async Task LastPage_CanBeShort()
    {
        var page = await Search(new ListingSearchQuery { Page = 3, PageSize = 5 }, ManyListings(12));

        Assert.Equal(2, page.Results.Count);
        Assert.Equal(3, page.TotalPages);
    }

    [Fact]
    public async Task ExactMultipleOfPageSize_DoesNotCreateAnExtraPage()
    {
        var page = await Search(new ListingSearchQuery { Page = 2, PageSize = 5 }, ManyListings(10));

        Assert.Equal(2, page.TotalPages);
        Assert.Equal(5, page.Results.Count);
    }

    [Fact]
    public async Task PageBeyondTheEnd_IsEmpty_AndStillReportsRealTotals()
    {
        var page = await Search(new ListingSearchQuery { Page = 9, PageSize = 5 }, ManyListings(12));

        Assert.Empty(page.Results);
        Assert.Equal(9, page.Page);
        Assert.Equal(12, page.TotalCount);
        Assert.Equal(3, page.TotalPages);
    }

    [Fact]
    public async Task HugePageNumber_DoesNotOverflow()
    {
        var page = await Search(new ListingSearchQuery { Page = int.MaxValue, PageSize = 100 }, ManyListings(3));

        Assert.Empty(page.Results);
    }

    [Fact]
    public async Task PageSizeOfOne_ReturnsOneItemPerPage()
    {
        var page = await Search(new ListingSearchQuery { Page = 2, PageSize = 1 }, ManyListings(3));

        Assert.Single(page.Results);
        Assert.Equal(3, page.TotalPages);
    }

    [Fact]
    public async Task ConsecutivePages_NeverRepeatOrSkipAnItem()
    {
        var listings = ManyListings(12);
        var allIds = new List<string>();

        for (var pageNumber = 1; pageNumber <= 3; pageNumber++)
        {
            var page = await Search(new ListingSearchQuery { Page = pageNumber, PageSize = 5, TargetBudget = 410_000 }, listings);
            allIds.AddRange(ExternalIds(page));
        }

        Assert.Equal(12, allIds.Distinct().Count());
        Assert.Equal(12, allIds.Count);
    }
}
