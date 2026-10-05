using Listings.Services.Models;

namespace Listings.Services.Search;

public class ListingQueryValidator
{
    public IReadOnlyList<ListingQueryError> Validate(ListingSearchQuery query)
    {
        var errors = new List<ListingQueryError>();

        if (query.MinPrice is < 0)
        {
            errors.Add(new("minPrice", "minPrice must be 0 or greater."));
        }

        if (query.MaxPrice is < 0)
        {
            errors.Add(new("maxPrice", "maxPrice must be 0 or greater."));
        }

        if (query.MinPrice > query.MaxPrice)
        {
            errors.Add(new("minPrice", "minPrice cannot be greater than maxPrice."));
        }

        if (query.MinBedrooms is < 0)
        {
            errors.Add(new("minBedrooms", "minBedrooms must be 0 or greater."));
        }

        if (query.TargetBudget is <= 0)
        {
            errors.Add(new("targetBudget", "targetBudget must be greater than 0."));
        }

        if (query.Page < 1)
        {
            errors.Add(new("page", "page must be 1 or greater."));
        }

        if (query.PageSize < 1 || query.PageSize > ListingSearchLimits.MaxPageSize)
        {
            errors.Add(new("pageSize", $"pageSize must be between 1 and {ListingSearchLimits.MaxPageSize}."));
        }

        return errors;
    }
}
