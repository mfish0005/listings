using Listings.Api.Controllers;
using Listings.Services.Catalog;
using Listings.Services.Models;
using Listings.Services.Search;
using Listings.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Listings.Tests.Api;

public class ListingsControllerTests
{
    private readonly Mock<IListingSearchService> _searchService = new();
    private readonly Mock<IListingService> _listingService = new();
    private readonly ListingsController _controller;

    public ListingsControllerTests()
    {
        _controller = new ListingsController(
            _searchService.Object,
            new ListingQueryValidator(),
            _listingService.Object,
            new ListingInputValidator(TestClock.Create()));
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

    private static ListingDetail Detail(int id = 7) => new(
        id, "MANUAL", "abc", "12 Test Lane", "Springfield", "VA", "22150", 450_000m, 3, 2.5m, 1800,
        38.78, -77.18, TestClock.Today, "active", "A bright, freshly painted home.");

    [Fact]
    public async Task Get_ReturnsOkWithTheListing_WhenItExists()
    {
        var detail = Detail();
        _listingService.Setup(service => service.GetAsync(7, It.IsAny<CancellationToken>())).ReturnsAsync(detail);

        var result = await _controller.Get(7, CancellationToken.None);

        Assert.Same(detail, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task Get_Returns404ProblemDetails_WhenItDoesNotExist()
    {
        _listingService.Setup(service => service.GetAsync(7, It.IsAny<CancellationToken>())).ReturnsAsync((ListingDetail?)null);

        var result = await _controller.Get(7, CancellationToken.None);

        var response = Assert.IsType<NotFoundObjectResult>(result);
        var problem = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(404, response.StatusCode);
        Assert.Equal("No listing exists with id 7.", problem.Detail);
    }

    [Fact]
    public async Task Create_Returns201WithLocation_WhenInputIsValid()
    {
        var input = ListingInputFactory.Valid();
        var detail = Detail(id: 42);
        _listingService.Setup(service => service.CreateAsync(input, It.IsAny<CancellationToken>())).ReturnsAsync(detail);

        var result = await _controller.Create(input, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ListingsController.Get), created.ActionName);
        Assert.Equal(42, created.RouteValues!["id"]);
        Assert.Same(detail, created.Value);
    }

    [Fact]
    public async Task Create_Returns400WithEveryProblem_AndDoesNotCallTheService_WhenInputIsInvalid()
    {
        var input = ListingInputFactory.Valid() with { Price = -5m, State = "Virginia" };

        var result = await _controller.Create(input, CancellationToken.None);

        var response = Assert.IsType<ObjectResult>(result);
        var problem = Assert.IsType<ValidationProblemDetails>(response.Value);
        Assert.Equal(400, response.StatusCode);
        Assert.Equal("Invalid listing", problem.Title);
        Assert.Contains("price", problem.Errors.Keys);
        Assert.Contains("state", problem.Errors.Keys);
        _listingService.Verify(
            service => service.CreateAsync(It.IsAny<ListingInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Update_ReturnsOkWithTheUpdatedListing_WhenItExists()
    {
        var input = ListingInputFactory.Valid();
        var detail = Detail();
        _listingService.Setup(service => service.UpdateAsync(7, input, It.IsAny<CancellationToken>())).ReturnsAsync(detail);

        var result = await _controller.Update(7, input, CancellationToken.None);

        Assert.Same(detail, Assert.IsType<OkObjectResult>(result).Value);
    }

    [Fact]
    public async Task Update_Returns404_WhenTheListingDoesNotExist()
    {
        _listingService
            .Setup(service => service.UpdateAsync(7, It.IsAny<ListingInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ListingDetail?)null);

        var result = await _controller.Update(7, ListingInputFactory.Valid(), CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Update_Returns400_AndDoesNotCallTheService_WhenInputIsInvalid()
    {
        var result = await _controller.Update(7, ListingInputFactory.Valid() with { Address = "" }, CancellationToken.None);

        var problem = Assert.IsType<ValidationProblemDetails>(Assert.IsType<ObjectResult>(result).Value);
        Assert.Contains("address", problem.Errors.Keys);
        _listingService.Verify(
            service => service.UpdateAsync(It.IsAny<int>(), It.IsAny<ListingInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Delete_Returns204_WhenTheListingWasDeleted()
    {
        _listingService.Setup(service => service.DeleteAsync(7, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.Delete(7, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_Returns404ProblemDetails_WhenTheListingDoesNotExist()
    {
        _listingService.Setup(service => service.DeleteAsync(7, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.Delete(7, CancellationToken.None);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var problem = Assert.IsType<ProblemDetails>(notFound.Value);
        Assert.Equal(404, problem.Status);
        Assert.Contains("7", problem.Detail);
    }
}
