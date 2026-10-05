using Microsoft.Extensions.Time.Testing;

namespace Listings.Tests.Helpers;

public static class TestClock
{
    public static readonly DateOnly Today = new(2026, 10, 5);

    public static FakeTimeProvider Create() => new(new DateTimeOffset(2026, 10, 5, 12, 0, 0, TimeSpan.Zero));
}
