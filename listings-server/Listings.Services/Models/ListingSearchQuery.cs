namespace Listings.Services.Models;

public record ListingSearchQuery
{
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public int? MinBedrooms { get; init; }
    public string? City { get; init; }
    public string? Keyword { get; init; }
    public decimal? TargetBudget { get; init; }
    public int Page { get; init; } = ListingSearchLimits.DefaultPage;
    public int PageSize { get; init; } = ListingSearchLimits.DefaultPageSize;
}
