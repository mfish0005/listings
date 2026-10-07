using Listings.Data.Context;
using Listings.Data.Entities;
using Listings.Data.Seed;
using Listings.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace Listings.Tests.Seed;

public class ListingSeederTests
{
    private const int SampleListingCount = 12;
    private const int LessonListingCount = 17;

    private static ListingsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ListingsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ListingsDbContext(options);
    }

    private static Task Seed(ListingsDbContext context, int demoListings) =>
        ListingSeeder.SeedAsync(context, new SeedOptions { DemoListings = demoListings }, TestClock.Today);

    private static Task<int> CountDemoListings(ListingsDbContext context) =>
        context.Listings.CountAsync(l => l.ExternalId.StartsWith(DemoListingGenerator.ExternalIdPrefix));

    [Fact]
    public async Task EmptyDatabase_ReceivesTheSampleFeed()
    {
        await using var context = CreateContext();

        await Seed(context, demoListings: 0);

        Assert.Equal(SampleListingCount, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task SeedingTwice_DoesNotDuplicateAnything()
    {
        await using var context = CreateContext();

        await Seed(context, demoListings: 25);
        await Seed(context, demoListings: 25);

        Assert.Equal(SampleListingCount + LessonListingCount + 25, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task DemoListingsDisabled_AddsNoDemoRows()
    {
        await using var context = CreateContext();

        await Seed(context, demoListings: 0);

        Assert.Equal(0, await CountDemoListings(context));
    }

    [Fact]
    public async Task NegativeDemoListings_IsTreatedAsDisabled()
    {
        await using var context = CreateContext();

        await Seed(context, demoListings: -5);

        Assert.Equal(0, await CountDemoListings(context));
    }

    [Fact]
    public async Task DemoListingsEnabled_AddsLessonsAndFillerAlongsideTheSampleFeed()
    {
        await using var context = CreateContext();

        await Seed(context, demoListings: 40);

        Assert.Equal(LessonListingCount + 40, await CountDemoListings(context));
        Assert.Equal(SampleListingCount, await context.Listings.CountAsync(l => !l.ExternalId.StartsWith(DemoListingGenerator.ExternalIdPrefix)));
    }

    [Fact]
    public async Task ChangingTheDemoCount_ReplacesOnlyDemoRows()
    {
        await using var context = CreateContext();
        await Seed(context, demoListings: 40);

        await Seed(context, demoListings: 10);

        Assert.Equal(LessonListingCount + 10, await CountDemoListings(context));
        Assert.Equal(SampleListingCount, await context.Listings.CountAsync(l => !l.ExternalId.StartsWith(DemoListingGenerator.ExternalIdPrefix)));
    }

    [Fact]
    public async Task TurningDemoListingsOff_RemovesThem()
    {
        await using var context = CreateContext();
        await Seed(context, demoListings: 40);

        await Seed(context, demoListings: 0);

        Assert.Equal(0, await CountDemoListings(context));
        Assert.Equal(SampleListingCount, await context.Listings.CountAsync());
    }

    [Fact]
    public async Task UnchangedDemoCount_LeavesExistingDemoRowsUntouched()
    {
        await using var context = CreateContext();
        await Seed(context, demoListings: 5);
        var idsBefore = await context.Listings.OrderBy(l => l.Id).Select(l => l.Id).ToListAsync();

        await Seed(context, demoListings: 5);

        var idsAfter = await context.Listings.OrderBy(l => l.Id).Select(l => l.Id).ToListAsync();
        Assert.Equal(idsBefore, idsAfter);
    }

    [Fact]
    public async Task ListingsWithoutTheDemoPrefix_SurviveDemoChanges()
    {
        await using var context = CreateContext();
        await Seed(context, demoListings: 5);
        context.Listings.Add(ListingFactory.Create(source: "MLS_C", externalId: "MINE-1"));
        await context.SaveChangesAsync();

        await Seed(context, demoListings: 0);

        Assert.True(await context.Listings.AnyAsync(l => l.ExternalId == "MINE-1"));
    }
}
