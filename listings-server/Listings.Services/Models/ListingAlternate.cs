namespace Listings.Services.Models;

public record ListingAlternate(int Id, string Source, string ExternalId, decimal Price, DateOnly ListedDate);
