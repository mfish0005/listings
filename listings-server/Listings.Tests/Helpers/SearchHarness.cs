using Listings.Data.Context;
using Listings.Data.Entities;
using Listings.Services.Models;
using Listings.Services.Scoring;
using Listings.Services.Search;
using Microsoft.EntityFrameworkCore;

namespace Listings.Tests.Helpers;

public static class SearchHarness
{
    public static async Task<PagedResult<ListingResult>> Search(ListingSearchQuery query, params Listing[] listings)
    {
        await using var context = CreateContext();
        context.Listings.AddRange(listings);
        await context.SaveChangesAsync();

        return await SearchAsync(context, query);
    }

    public static ListingsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ListingsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ListingsDbContext(options);
    }

    public static Task<PagedResult<ListingResult>> SearchAsync(ListingsDbContext context, ListingSearchQuery query)
    {
        var scorer = new ListingScorer(new ScoringOptions(), TestClock.Create());

        return new ListingSearchService(context, scorer).SearchAsync(query);
    }
}
