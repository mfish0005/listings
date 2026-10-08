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

    /// <summary>Searches listings, ranked by relevance.</summary>
    /// <remarks>
    /// Filters narrow the results. <c>targetBudget</c> only changes their order. Without it, results are ranked by recency alone.
    /// Listings of the same home from different feeds are collapsed into the best-ranked one unless <c>includeDuplicates</c> is true.
    /// </remarks>
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

    /// <summary>Gets one listing by its database id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ListingDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var listing = await listingService.GetAsync(id, cancellationToken);

        return listing is null ? ListingNotFound(id) : Ok(listing);
    }

    /// <summary>Creates a listing.</summary>
    /// <remarks>The database assigns the id. The source is set to <c>MANUAL</c> and the external id is generated.</remarks>
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

    /// <summary>Replaces the editable fields of a listing.</summary>
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

    /// <summary>Deletes a listing.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await listingService.DeleteAsync(id, cancellationToken);

        return deleted ? NoContent() : ListingNotFound(id);
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
