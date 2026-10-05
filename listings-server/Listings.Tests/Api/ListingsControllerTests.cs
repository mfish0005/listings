using Listings.Api.Controllers;
using Listings.Services.Models;
using Listings.Services.Search;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Listings.Tests.Api;

public class ListingsControllerTests
{
    private readonly Mock<IListingSearchService> _searchService = new();
    private readonly ListingsController _controller;

    public ListingsControllerTests()
    {
        _controller = new ListingsController(_searchService.Object, new ListingQueryValidator());
    }

    [Fact]
    public async Task Search_Returns400WithDetail_WhenQueryIsInvalid()
    {
        var query = new ListingSearchQuery { MinPrice = 500_000, MaxPrice = 100_000 };

        var result = await _controller.Search(query, CancellationToken.None);

        var response = Assert.IsType<ObjectResult>(result);
        var problem = Assert.IsType<ValidationProblemDetails>(response.Value);
        Assert.Equal(400, response.StatusCode);
        Assert.Equal("minPrice cannot be greater than maxPrice.", problem.Detail);
        Assert.Contains("minPrice", problem.Errors.Keys);
    }

    [Fact]
    public async Task Search_JoinsEveryProblemIntoDetail()
    {
        var query = new ListingSearchQuery { PageSize = 0, Page = 0 };

        var result = await _controller.Search(query, CancellationToken.None);

        var problem = Assert.IsType<ValidationProblemDetails>(Assert.IsType<ObjectResult>(result).Value);
        Assert.Contains("page must be 1 or greater.", problem.Detail);
        Assert.Contains("pageSize must be between 1 and 100.", problem.Detail);
    }

    [Fact]
    public async Task Search_DoesNotCallTheService_WhenQueryIsInvalid()
    {
        await _controller.Search(new ListingSearchQuery { PageSize = 0 }, CancellationToken.None);

        _searchService.Verify(
            service => service.SearchAsync(It.IsAny<ListingSearchQuery>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Search_ReturnsOkWithThePage_WhenQueryIsValid()
    {
        var query = new ListingSearchQuery { City = "Springfield" };
        var expected = new PagedResult<ListingResult>([], 1, 5, 0, 0);
        _searchService
            .Setup(service => service.SearchAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _controller.Search(query, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Same(expected, ok.Value);
    }
}
