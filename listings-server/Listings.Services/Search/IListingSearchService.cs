using Listings.Services.Models;

namespace Listings.Services.Search;

public interface IListingSearchService
{
    Task<PagedResult<ListingResult>> SearchAsync(ListingSearchQuery query, CancellationToken cancellationToken = default);
}
