namespace Listings.Data.Entities;

public static class ListingStatuses
{
    public const string Active = "active";
    public const string Pending = "pending";
    public const string Sold = "sold";

    public static readonly IReadOnlyList<string> All = [Active, Pending, Sold];
}
