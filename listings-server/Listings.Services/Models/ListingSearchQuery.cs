namespace Listings.Services.Models;

public record ListingSearchQuery
{
    /// <summary>Only listings priced at or above this amount.</summary>
    public decimal? MinPrice { get; init; }

    /// <summary>Only listings priced at or below this amount. Must not be less than <c>minPrice</c>.</summary>
    public decimal? MaxPrice { get; init; }

    /// <summary>Only listings with at least this many bedrooms.</summary>
    public int? MinBedrooms { get; init; }

    /// <summary>Only listings whose city starts with this text, ignoring case.</summary>
    public string? City { get; init; }

    /// <summary>Only listings whose description contains every word given, ignoring case.</summary>
    public string? Keyword { get; init; }

    /// <summary>The price the user would like to pay. Ranks listings by how well they fit it, and does not exclude any. Must be positive.</summary>
    public decimal? TargetBudget { get; init; }

    /// <summary>Show every feed's copy of a home instead of only the best-ranked one.</summary>
    public bool IncludeDuplicates { get; init; }

    /// <summary>The page to return, starting at 1.</summary>
    public int Page { get; init; } = ListingSearchLimits.DefaultPage;

    /// <summary>How many listings per page, from 1 to 100.</summary>
    public int PageSize { get; init; } = ListingSearchLimits.DefaultPageSize;
}
