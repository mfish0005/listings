using Listings.Data.Context;
using Listings.Data.Seed;
using Listings.Services.Models;
using Listings.Services.Scoring;
using Listings.Services.Search;
using Listings.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Listings.Tests.Seed;

public class DemoLessonSearchTests
{
    private const decimal Budget = DemoListingGenerator.LessonBudget;

    private static async Task<PagedResult<ListingResult>> SearchLesson(string city, decimal? targetBudget)
    {
        var options = new DbContextOptionsBuilder<ListingsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new ListingsDbContext(options);
        await ListingSeeder.SeedAsync(context, new SeedOptions { DemoListings = 1 }, TestClock.Today);

        var service = new ListingSearchService(context, new ListingScorer(new ScoringOptions(), TestClock.Create()));

        return await service.SearchAsync(new ListingSearchQuery
        {
            City = city,
            TargetBudget = targetBudget,
            PageSize = ListingSearchLimits.MaxPageSize
        });
    }

    private static string[] LessonIds(PagedResult<ListingResult> page) =>
        page.Results.Select(result => result.ExternalId.Replace(DemoListingGenerator.ExternalIdPrefix, string.Empty)).ToArray();

    [Fact]
    public async Task PriceLesson_RanksByHowCloseThePriceIsToTheBudget()
    {
        var page = await SearchLesson(DemoListingGenerator.PriceLessonCity, Budget);

        Assert.Equal(["PRICE-3", "PRICE-2", "PRICE-4", "PRICE-5", "PRICE-1", "PRICE-6", "PRICE-7"], LessonIds(page));
    }

    [Fact]
    public async Task PriceLesson_IsKindToUnderBudgetAndHarshToOverBudget()
    {
        var page = await SearchLesson(DemoListingGenerator.PriceLessonCity, Budget);

        var fitById = page.Results.ToDictionary(r => r.ExternalId, r => r.BudgetFit);

        Assert.Equal(1.0, fitById["DEMO-PRICE-3"]);
        Assert.Equal(0.9, fitById["DEMO-PRICE-2"]);
        Assert.Equal(0.9, fitById["DEMO-PRICE-4"]);
        Assert.Equal(0.8, fitById["DEMO-PRICE-5"]);
        Assert.Equal(0.75, fitById["DEMO-PRICE-1"]);
        Assert.Equal(0.5, fitById["DEMO-PRICE-6"]);
        Assert.Equal(0.0, fitById["DEMO-PRICE-7"]);
    }

    [Fact]
    public async Task PriceLesson_TiedScoresFallBackToTheCheaperListing()
    {
        var page = await SearchLesson(DemoListingGenerator.PriceLessonCity, Budget);

        var underBudget = page.Results.Single(r => r.ExternalId == "DEMO-PRICE-2");
        var overBudget = page.Results.Single(r => r.ExternalId == "DEMO-PRICE-4");

        Assert.Equal(underBudget.RelevanceScore, overBudget.RelevanceScore);
        Assert.True(underBudget.Price < overBudget.Price);
        Assert.Equal(["PRICE-2", "PRICE-4"], LessonIds(page).Where(id => id is "PRICE-2" or "PRICE-4"));
    }

    [Fact]
    public async Task AgeLesson_RanksNewestFirst()
    {
        var page = await SearchLesson(DemoListingGenerator.AgeLessonCity, Budget);

        Assert.Equal(["AGE-1", "AGE-2", "AGE-3", "AGE-4", "AGE-5", "AGE-6"], LessonIds(page));
    }

    [Fact]
    public async Task AgeLesson_RanksTheSameWithoutABudget()
    {
        var page = await SearchLesson(DemoListingGenerator.AgeLessonCity, targetBudget: null);

        Assert.Equal(["AGE-1", "AGE-2", "AGE-3", "AGE-4", "AGE-5", "AGE-6"], LessonIds(page));
    }

    [Fact]
    public async Task AgeLesson_HalvesTheRecencyScoreEveryThirtyDays()
    {
        var page = await SearchLesson(DemoListingGenerator.AgeLessonCity, Budget);

        var recencyById = page.Results.ToDictionary(r => r.ExternalId, r => r.Recency);

        Assert.Equal(0.5, recencyById["DEMO-AGE-3"]);
        Assert.Equal(0.3333, recencyById["DEMO-AGE-4"]);
    }

    [Fact]
    public async Task MixLesson_ShowsRecencyBeatingAnOverBudgetPrice()
    {
        var page = await SearchLesson(DemoListingGenerator.MixLessonCity, Budget);

        Assert.Equal(["MIX-2", "MIX-3", "MIX-1", "MIX-4"], LessonIds(page));
    }

    [Fact]
    public async Task MixLesson_WithoutABudget_RanksByAgeAlone()
    {
        var page = await SearchLesson(DemoListingGenerator.MixLessonCity, targetBudget: null);

        Assert.Equal(["MIX-4", "MIX-2", "MIX-3", "MIX-1"], LessonIds(page));
    }
}
