using Listings.Data.Entities;
using Listings.Data.Repositories;
using Listings.Services.Models;

namespace Listings.Services.Catalog;

public class ListingService(IListingRepository repository) : IListingService
{
    public async Task<ListingDetail?> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var listing = await repository.GetAsync(id, cancellationToken);

        return listing is null ? null : ToDetail(listing);
    }

    public async Task<ListingDetail> CreateAsync(ListingInput input, CancellationToken cancellationToken = default)
    {
        var listing = new Listing
        {
            Source = ListingSources.Manual,
            ExternalId = Guid.NewGuid().ToString("N")
        };

        Apply(listing, input);
        await repository.AddAsync(listing, cancellationToken);

        return ToDetail(listing);
    }

    public async Task<ListingDetail?> UpdateAsync(int id, ListingInput input, CancellationToken cancellationToken = default)
    {
        var listing = await repository.GetAsync(id, cancellationToken);

        if (listing is null)
        {
            return null;
        }

        Apply(listing, input);
        await repository.UpdateAsync(listing, cancellationToken);

        return ToDetail(listing);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default) =>
        repository.DeleteAsync(id, cancellationToken);

    private static void Apply(Listing listing, ListingInput input)
    {
        listing.Address = input.Address!.Trim();
        listing.City = input.City!.Trim();
        listing.State = input.State!.Trim().ToUpperInvariant();
        listing.Zip = input.Zip!.Trim();
        listing.Price = input.Price!.Value;
        listing.Bedrooms = input.Bedrooms!.Value;
        listing.Bathrooms = input.Bathrooms!.Value;
        listing.Sqft = input.Sqft!.Value;
        listing.Latitude = input.Latitude!.Value;
        listing.Longitude = input.Longitude!.Value;
        listing.ListedDate = input.ListedDate!.Value;
        listing.Status = string.IsNullOrWhiteSpace(input.Status) ? ListingStatuses.Active : input.Status.Trim().ToLowerInvariant();
        listing.Description = input.Description!.Trim();
    }

    private static ListingDetail ToDetail(Listing listing) => new(
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
        listing.Description);
}
