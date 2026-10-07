using Listings.Data.Context;
using Listings.Data.Entities;
using Listings.Services.Models;
using Listings.Services.Scoring;
using Microsoft.EntityFrameworkCore;

namespace Listings.Services.Search;

public class ListingSearchService(ListingsDbContext context, ListingScorer scorer) : IListingSearchService
{
    public async Task<PagedResult<ListingResult>> SearchAsync(ListingSearchQuery query, CancellationToken cancellationToken = default)
    {
        var candidates = await ApplyFilters(context.Listings.AsNoTracking(), query).ToListAsync(cancellationToken);

        var ranked = candidates
            .Select(listing => ToResult(listing, scorer.Score(listing.Price, listing.ListedDate, query.TargetBudget)))
            .OrderByDescending(result => result.RelevanceScore)
            .ThenByDescending(result => result.ListedDate)
            .ThenBy(result => result.Price)
            .ThenBy(result => result.Source, StringComparer.Ordinal)
            .ThenBy(result => result.ExternalId, StringComparer.Ordinal)
            .ToList();

        return ToPage(ranked, query.Page, query.PageSize);
    }

    private static IQueryable<Listing> ApplyFilters(IQueryable<Listing> listings, ListingSearchQuery query)
    {
        var city = Clean(query.City)?.ToLower();
        var keywords = SplitWords(query.Keyword);

        if (query.MinPrice is { } minPrice)
        {
            listings = listings.Where(l => l.Price >= minPrice);
        }

        if (query.MaxPrice is { } maxPrice)
        {
            listings = listings.Where(l => l.Price <= maxPrice);
        }

        if (query.MinBedrooms is { } minBedrooms)
        {
            listings = listings.Where(l => l.Bedrooms >= minBedrooms);
        }

        if (city is not null)
        {
            listings = listings.Where(l => l.City.ToLower().StartsWith(city));
        }

        foreach (var keyword in keywords)
        {
            listings = listings.Where(l => l.Description.ToLower().Contains(keyword));
        }

        return listings;
    }

    private static PagedResult<ListingResult> ToPage(List<ListingResult> ranked, int page, int pageSize)
    {
        var totalCount = ranked.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        var skipped = (long)(page - 1) * pageSize;

        var results = skipped >= totalCount
            ? []
            : ranked.Skip((int)skipped).Take(pageSize).ToList();

        return new PagedResult<ListingResult>(results, page, pageSize, totalCount, totalPages);
    }

    private static ListingResult ToResult(Listing listing, ListingScore score) => new(
        listing.Id,
        listing.Source,
        listing.ExternalId,
        listing.Address,
        listing.City,
        listing.State,
        listing.Zip,
        listing.Price,
        listing.Bedrooms,
        listing.Bathrooms,
        listing.Sqft,
        listing.Latitude,
        listing.Longitude,
        listing.ListedDate,
        listing.Status,
        listing.Description,
        score.Relevance,
        score.BudgetFit,
        score.Recency);

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string[] SplitWords(string? value) =>
        (value ?? string.Empty).ToLower().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Distinct().ToArray();
}
