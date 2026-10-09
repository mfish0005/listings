using Listings.Data.Context;
using Listings.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Listings.Data.Repositories;

public class ListingRepository(ListingsDbContext context) : IListingRepository
{
    public async Task<IReadOnlyList<Listing>> SearchAsync(ListingFilter filter, CancellationToken cancellationToken = default) =>
        await ApplyFilter(context.Listings.AsNoTracking(), filter).ToListAsync(cancellationToken);

    public Task<Listing?> GetAsync(int id, CancellationToken cancellationToken = default) =>
        context.Listings.FirstOrDefaultAsync(listing => listing.Id == id, cancellationToken);

    public async Task AddAsync(Listing listing, CancellationToken cancellationToken = default)
    {
        context.Listings.Add(listing);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default)
    {
        context.Listings.Update(listing);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var listing = await GetAsync(id, cancellationToken);

        if (listing is null)
        {
            return false;
        }

        context.Listings.Remove(listing);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static IQueryable<Listing> ApplyFilter(IQueryable<Listing> listings, ListingFilter filter)
    {
        var city = Clean(filter.City)?.ToLower();
        var keywords = SplitWords(filter.Keyword);

        if (filter.MinPrice is { } minPrice)
        {
            listings = listings.Where(l => l.Price >= minPrice);
        }

        if (filter.MaxPrice is { } maxPrice)
        {
            listings = listings.Where(l => l.Price <= maxPrice);
        }

        if (filter.MinBedrooms is { } minBedrooms)
        {
            listings = listings.Where(l => l.Bedrooms >= minBedrooms);
        }

        // City matches by prefix, so "spring" finds Springfield.
        if (city is not null)
        {
            listings = listings.Where(l => l.City.ToLower().StartsWith(city));
        }

        // Every keyword must appear in the description.
        foreach (var keyword in keywords)
        {
            listings = listings.Where(l => l.Description.ToLower().Contains(keyword));
        }

        return listings;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string[] SplitWords(string? value) =>
        (value ?? string.Empty).ToLower().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Distinct().ToArray();
}
