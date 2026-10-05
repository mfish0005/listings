using Listings.Services.Models;
using Listings.Services.Search;

namespace Listings.Tests.Search;

public class ListingQueryValidatorTests
{
    private readonly ListingQueryValidator _validator = new();

    private IReadOnlyList<string> InvalidFields(ListingSearchQuery query) =>
        _validator.Validate(query).Select(error => error.Field).ToList();

    [Fact]
    public void DefaultQuery_IsValid()
    {
        Assert.Empty(_validator.Validate(new ListingSearchQuery()));
    }

    [Fact]
    public void FullyPopulatedQuery_IsValid()
    {
        var query = new ListingSearchQuery
        {
            MinPrice = 100_000,
            MaxPrice = 600_000,
            MinBedrooms = 2,
            City = "Springfield",
            Keyword = "pets",
            TargetBudget = 500_000,
            Page = 2,
            PageSize = 10
        };

        Assert.Empty(_validator.Validate(query));
    }

    [Fact]
    public void MinPriceEqualToMaxPrice_IsValid()
    {
        var query = new ListingSearchQuery { MinPrice = 400_000, MaxPrice = 400_000 };

        Assert.Empty(_validator.Validate(query));
    }

    [Fact]
    public void MinPriceGreaterThanMaxPrice_IsInvalid()
    {
        var query = new ListingSearchQuery { MinPrice = 500_000, MaxPrice = 100_000 };

        Assert.Equal(["minPrice"], InvalidFields(query));
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-0.01)]
    public void NegativeMinPrice_IsInvalid(double minPrice)
    {
        var query = new ListingSearchQuery { MinPrice = (decimal)minPrice };

        Assert.Equal(["minPrice"], InvalidFields(query));
    }

    [Fact]
    public void NegativeMaxPrice_IsInvalid()
    {
        var query = new ListingSearchQuery { MaxPrice = -1 };

        Assert.Equal(["maxPrice"], InvalidFields(query));
    }

    [Fact]
    public void NegativeMinBedrooms_IsInvalid()
    {
        var query = new ListingSearchQuery { MinBedrooms = -1 };

        Assert.Equal(["minBedrooms"], InvalidFields(query));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void NonPositiveTargetBudget_IsInvalid(int targetBudget)
    {
        var query = new ListingSearchQuery { TargetBudget = targetBudget };

        Assert.Equal(["targetBudget"], InvalidFields(query));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void PageBelowOne_IsInvalid(int page)
    {
        var query = new ListingSearchQuery { Page = page };

        Assert.Equal(["page"], InvalidFields(query));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(101)]
    public void PageSizeOutsideOneToOneHundred_IsInvalid(int pageSize)
    {
        var query = new ListingSearchQuery { PageSize = pageSize };

        Assert.Equal(["pageSize"], InvalidFields(query));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(100)]
    public void PageSizeAtTheBoundaries_IsValid(int pageSize)
    {
        var query = new ListingSearchQuery { PageSize = pageSize };

        Assert.Empty(_validator.Validate(query));
    }

    [Fact]
    public void MultipleProblems_AreAllReported()
    {
        var query = new ListingSearchQuery { MinPrice = 5, MaxPrice = 1, Page = 0, PageSize = 0 };

        Assert.Equal(["minPrice", "page", "pageSize"], InvalidFields(query));
    }
}
