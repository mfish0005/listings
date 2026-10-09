using Listings.Data.Entities;
using Listings.Data.Repositories;
using Listings.Services.Models;
using Listings.Services.Scoring;

namespace Listings.Services.Search;

public class ListingSearchService(IListingRepository repository, ListingScorer scorer) : IListingSearchService
{
    public async Task<PagedResult<ListingResult>> SearchAsync(ListingSearchQuery query, CancellationToken cancellationToken = default)
    {        
        var candidates = await repository.SearchAsync(ToFilter(query), cancellationToken);
        
        var ranked = candidates
            .Select(listing => ToResult(listing, scorer.Score(listing.Price, listing.ListedDate, query.TargetBudget)))
            .OrderByDescending(result => result.RelevanceScore)
            .ThenByDescending(result => result.ListedDate)
            .ThenBy(result => result.Price)
            .ThenBy(result => result.Source, StringComparer.Ordinal)
            .ThenBy(result => result.ExternalId, StringComparer.Ordinal)
            .ToList();

        return ToPage(query.IncludeDuplicates ? ranked : CollapseDuplicates(ranked), query.Page, query.PageSize);
    }

    private static ListingFilter ToFilter(ListingSearchQuery query) => new()
    {
        MinPrice = query.MinPrice,
        MaxPrice = query.MaxPrice,
        MinBedrooms = query.MinBedrooms,
        City = query.City,
        Keyword = query.Keyword
    };
    
    private static List<ListingResult> CollapseDuplicates(List<ListingResult> ranked) =>
        ranked
            .GroupBy(result => PropertyKey.For(result.Address, result.City, result.State))
            .Select(group => group.First() with { AlsoListedBy = group.Skip(1).Select(ToAlternate).ToList() })
            .ToList();

    private static ListingAlternate ToAlternate(ListingResult result) =>
        new(result.Id, result.Source, result.ExternalId, result.Price, result.ListedDate);

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
        score.Recency,
        []);
}
