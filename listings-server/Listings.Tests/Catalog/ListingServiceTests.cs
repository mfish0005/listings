using Listings.Data.Context;
using Listings.Data.Entities;
using Listings.Data.Repositories;
using Listings.Services.Catalog;
using Listings.Services.Models;
using Listings.Services.Scoring;
using Listings.Services.Search;
using Listings.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Listings.Tests.Catalog;

public class ListingServiceTests
{
    private static ListingsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ListingsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ListingsDbContext(options);
    }

    [Fact]
    public async Task Create_StoresTheListingAsManualWithAGeneratedExternalId()
    {
        await using var context = CreateContext();

        var created = await new ListingService(new ListingRepository(context)).CreateAsync(ListingInputFactory.Valid());

        Assert.True(created.Id > 0);
        Assert.Equal(ListingSources.Manual, created.Source);
        Assert.False(string.IsNullOrWhiteSpace(created.ExternalId));
        Assert.Equal(1, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task Create_GivesEveryListingItsOwnExternalId()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));

        var first = await service.CreateAsync(ListingInputFactory.Valid());
        var second = await service.CreateAsync(ListingInputFactory.Valid());

        Assert.NotEqual(first.ExternalId, second.ExternalId);
        Assert.NotEqual(first.Id, second.Id);
    }

    [Fact]
    public async Task Create_NormalizesTextAndDefaultsTheStatus()
    {
        await using var context = CreateContext();
        var input = ListingInputFactory.Valid() with
        {
            Address = "  12 Test Lane  ",
            City = " Springfield ",
            State = "va",
            Zip = " 22150 ",
            Description = "  Nice place.  ",
            Status = null
        };

        var created = await new ListingService(new ListingRepository(context)).CreateAsync(input);

        Assert.Equal("12 Test Lane", created.Address);
        Assert.Equal("Springfield", created.City);
        Assert.Equal("VA", created.State);
        Assert.Equal("22150", created.Zip);
        Assert.Equal("Nice place.", created.Description);
        Assert.Equal(ListingStatuses.Active, created.Status);
    }

    [Fact]
    public async Task Create_LowercasesAnExplicitStatus()
    {
        await using var context = CreateContext();

        var created = await new ListingService(new ListingRepository(context)).CreateAsync(ListingInputFactory.Valid() with { Status = "Pending" });

        Assert.Equal(ListingStatuses.Pending, created.Status);
    }

    [Fact]
    public async Task Create_MakesTheListingFindableBySearch()
    {
        await using var context = CreateContext();
        await new ListingService(new ListingRepository(context)).CreateAsync(ListingInputFactory.Valid() with { City = "Newtown", Price = 300_000m });
        var search = new ListingSearchService(new ListingRepository(context), new ListingScorer(new ScoringOptions(), TestClock.Create()));

        var page = await search.SearchAsync(new ListingSearchQuery { City = "newtown", MaxPrice = 350_000m });

        var result = Assert.Single(page.Results);
        Assert.Equal("12 Test Lane", result.Address);
    }

    [Fact]
    public async Task Get_ReturnsTheListing()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var created = await service.CreateAsync(ListingInputFactory.Valid());

        var found = await service.GetAsync(created.Id);

        Assert.Equal(created, found);
    }

    [Fact]
    public async Task Get_ReturnsNull_WhenTheListingDoesNotExist()
    {
        await using var context = CreateContext();

        Assert.Null(await new ListingService(new ListingRepository(context)).GetAsync(999));
    }

    [Fact]
    public async Task Update_ReplacesTheEditableFields()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var created = await service.CreateAsync(ListingInputFactory.Valid());
        var edit = ListingInputFactory.Valid() with
        {
            Address = "99 New Road",
            City = "Reston",
            Price = 610_000m,
            Bedrooms = 4,
            Status = "sold",
            Description = "Updated description."
        };

        var updated = await service.UpdateAsync(created.Id, edit);

        Assert.NotNull(updated);
        Assert.Equal("99 New Road", updated.Address);
        Assert.Equal("Reston", updated.City);
        Assert.Equal(610_000m, updated.Price);
        Assert.Equal(4, updated.Bedrooms);
        Assert.Equal(ListingStatuses.Sold, updated.Status);
        Assert.Equal(updated, await service.GetAsync(created.Id));
    }

    [Fact]
    public async Task Update_KeepsTheIdentityOfTheListing()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var created = await service.CreateAsync(ListingInputFactory.Valid());

        var updated = await service.UpdateAsync(created.Id, ListingInputFactory.Valid() with { City = "Reston" });

        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(created.Source, updated.Source);
        Assert.Equal(created.ExternalId, updated.ExternalId);
    }

    [Fact]
    public async Task Update_CanEditAFeedListing()
    {
        await using var context = CreateContext();
        var feedListing = ListingFactory.Create(source: "MLS_A", externalId: "A1", city: "Springfield");
        context.Listings.Add(feedListing);
        await context.SaveChangesAsync();

        var updated = await new ListingService(new ListingRepository(context)).UpdateAsync(feedListing.Id, ListingInputFactory.Valid() with { City = "Reston" });

        Assert.NotNull(updated);
        Assert.Equal("MLS_A", updated.Source);
        Assert.Equal("A1", updated.ExternalId);
        Assert.Equal("Reston", updated.City);
    }

    [Fact]
    public async Task Update_LeavesOtherListingsAlone()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var first = await service.CreateAsync(ListingInputFactory.Valid() with { City = "Springfield" });
        var second = await service.CreateAsync(ListingInputFactory.Valid() with { City = "Vienna" });

        await service.UpdateAsync(first.Id, ListingInputFactory.Valid() with { City = "Reston" });

        Assert.Equal("Vienna", (await service.GetAsync(second.Id))!.City);
    }

    [Fact]
    public async Task Update_ReturnsNull_WhenTheListingDoesNotExist()
    {
        await using var context = CreateContext();

        var updated = await new ListingService(new ListingRepository(context)).UpdateAsync(999, ListingInputFactory.Valid());

        Assert.Null(updated);
        Assert.Equal(0, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task Delete_RemovesTheListing()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var created = await service.CreateAsync(ListingInputFactory.Valid());

        var deleted = await service.DeleteAsync(created.Id);

        Assert.True(deleted);
        Assert.Null(await service.GetAsync(created.Id));
        Assert.Equal(0, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task Delete_LeavesOtherListingsAlone()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var first = await service.CreateAsync(ListingInputFactory.Valid());
        var second = await service.CreateAsync(ListingInputFactory.Valid());

        await service.DeleteAsync(first.Id);

        Assert.NotNull(await service.GetAsync(second.Id));
        Assert.Equal(1, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task Delete_CanRemoveAFeedListing()
    {
        await using var context = CreateContext();
        var feedListing = new Listing { Source = "MLS_A", ExternalId = "A1" };
        context.Listings.Add(feedListing);
        await context.SaveChangesAsync();

        var deleted = await new ListingService(new ListingRepository(context)).DeleteAsync(feedListing.Id);

        Assert.True(deleted);
        Assert.Equal(0, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task Delete_ReturnsFalse_WhenTheListingDoesNotExist()
    {
        await using var context = CreateContext();

        var deleted = await new ListingService(new ListingRepository(context)).DeleteAsync(999);

        Assert.False(deleted);
    }

    [Fact]
    public async Task Delete_CannotRemoveTheSameListingTwice()
    {
        await using var context = CreateContext();
        var service = new ListingService(new ListingRepository(context));
        var created = await service.CreateAsync(ListingInputFactory.Valid());

        await service.DeleteAsync(created.Id);

        Assert.False(await service.DeleteAsync(created.Id));
    }
}
