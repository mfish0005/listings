using Listings.Api.Infrastructure;
using Listings.Services.Models;
using Listings.Services.Search;
using Microsoft.AspNetCore.Mvc;

namespace Listings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController(IListingSearchService searchService, ListingQueryValidator validator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ListingResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search([FromQuery] ListingSearchQuery query, CancellationToken cancellationToken)
    {
        var errors = validator.Validate(query);

        if (errors.Count > 0)
        {
            return ValidationProblemFactory.CreateResult(errors
                .GroupBy(error => error.Field)
                .ToDictionary(group => group.Key, group => group.Select(error => error.Message).ToArray()));
        }

        return Ok(await searchService.SearchAsync(query, cancellationToken));
    }
}
