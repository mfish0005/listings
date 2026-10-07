namespace Listings.Services.Models;

public static class ListingInputLimits
{
    public const int AddressMaxLength = 200;
    public const int CityMaxLength = 100;
    public const int DescriptionMaxLength = 2000;
    public const decimal MaxPrice = 1_000_000_000m;
    public const int MaxBedrooms = 20;
    public const decimal MaxBathrooms = 20m;
    public const int MaxSqft = 1_000_000;
}
