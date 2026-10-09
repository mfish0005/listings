namespace Listings.Data.Repositories;

public record ListingFilter
{
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public int? MinBedrooms { get; init; }
    public string? City { get; init; }
    public string? Keyword { get; init; }
}
