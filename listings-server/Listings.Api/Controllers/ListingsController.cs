using Listings.Api.Infrastructure;
using Listings.Services.Catalog;
using Listings.Services.Models;
using Listings.Services.Search;
using Microsoft.AspNetCore.Mvc;

namespace Listings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController(
    IListingSearchService searchService,
    ListingQueryValidator queryValidator,
    IListingService listingService,
    ListingInputValidator inputValidator) : ControllerBase
{
    private const string InvalidSearchTitle = "Invalid search request";
    private const string InvalidListingTitle = "Invalid listing";

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ListingResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search([FromQuery] ListingSearchQuery query, CancellationToken cancellationToken)
    {
        var errors = queryValidator.Validate(query);

        if (errors.Count > 0)
        {
            return InvalidRequest(errors, InvalidSearchTitle);
        }

        return Ok(await searchService.SearchAsync(query, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ListingDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var listing = await listingService.GetAsync(id, cancellationToken);

        return listing is null ? ListingNotFound(id) : Ok(listing);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ListingDetail), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] ListingInput input, CancellationToken cancellationToken)
    {
        var errors = inputValidator.Validate(input);

        if (errors.Count > 0)
        {
            return InvalidRequest(errors, InvalidListingTitle);
        }

        var listing = await listingService.CreateAsync(input, cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = listing.Id }, listing);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ListingDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] ListingInput input, CancellationToken cancellationToken)
    {
        var errors = inputValidator.Validate(input);

        if (errors.Count > 0)
        {
            return InvalidRequest(errors, InvalidListingTitle);
        }

        var listing = await listingService.UpdateAsync(id, input, cancellationToken);

        return listing is null ? ListingNotFound(id) : Ok(listing);
    }

    private NotFoundObjectResult ListingNotFound(int id) => NotFound(new ProblemDetails
    {
        Status = StatusCodes.Status404NotFound,
        Title = "Listing not found",
        Detail = $"No listing exists with id {id}."
    });

    private static ObjectResult InvalidRequest(IReadOnlyList<ListingQueryError> errors, string title)
    {
        var grouped = errors
            .GroupBy(error => error.Field)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Message).ToArray());

        return ValidationProblemFactory.CreateResult(grouped, title);
    }
}
