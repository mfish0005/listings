namespace Listings.Services.Models;

public record PagedResult<T>(
    IReadOnlyList<T> Results,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
