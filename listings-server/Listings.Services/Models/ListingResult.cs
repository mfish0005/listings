namespace Listings.Services.Models;

public record ListingResult(
    int Id,
    string Source,
    string ExternalId,
    string Address,
    string City,
    string State,
    string Zip,
    decimal Price,
    int Bedrooms,
    decimal Bathrooms,
    int Sqft,
    double Latitude,
    double Longitude,
    DateOnly ListedDate,
    string Status,
    string Description,
    double RelevanceScore,
    double? BudgetFit,
    double Recency,
    IReadOnlyList<ListingAlternate> AlsoListedBy);
