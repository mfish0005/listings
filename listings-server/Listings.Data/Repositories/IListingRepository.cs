using Listings.Data.Entities;

namespace Listings.Data.Repositories;

public interface IListingRepository
{
    Task<IReadOnlyList<Listing>> SearchAsync(ListingFilter filter, CancellationToken cancellationToken = default);

    Task<Listing?> GetAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Listing listing, CancellationToken cancellationToken = default);

    Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
