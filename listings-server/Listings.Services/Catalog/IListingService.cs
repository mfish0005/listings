using Listings.Services.Models;

namespace Listings.Services.Catalog;

public interface IListingService
{
    Task<ListingDetail?> GetAsync(int id, CancellationToken cancellationToken = default);

    Task<ListingDetail> CreateAsync(ListingInput input, CancellationToken cancellationToken = default);

    Task<ListingDetail?> UpdateAsync(int id, ListingInput input, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
