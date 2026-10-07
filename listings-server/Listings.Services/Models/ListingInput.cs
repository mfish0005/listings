namespace Listings.Services.Models;

public record ListingInput
{
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? Zip { get; init; }
    public decimal? Price { get; init; }
    public int? Bedrooms { get; init; }
    public decimal? Bathrooms { get; init; }
    public int? Sqft { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public DateOnly? ListedDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
}
