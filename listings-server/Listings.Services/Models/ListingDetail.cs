namespace Listings.Services.Models;

public record ListingDetail(
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
    string Description);
