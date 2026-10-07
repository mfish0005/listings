using System.Globalization;
using Listings.Data.Entities;

namespace Listings.Data.Seed;

public static class DemoListingGenerator
{
    public const string ExternalIdPrefix = "DEMO-";
    public const decimal LessonBudget = 500_000m;

    public const string PriceLessonCity = "Budgetville";
    public const string AgeLessonCity = "Agetown";
    public const string MixLessonCity = "Balanceburg";

    private static readonly string BudgetText = LessonBudget.ToString("C0", CultureInfo.GetCultureInfo("en-US"));

    private const string LessonSource = "MLS_A";
    private const int FillerSeed = 2026;
    private const int FillerMaxAgeInDays = 180;

    private static readonly string[] FillerCities =
    [
        "Springfield", "Fairfax", "Vienna", "Reston", "Manassas", "Chantilly", "Arlington", "Alexandria",
        "Herndon", "Centreville", "Burke", "Annandale", "Falls Church", "McLean", "Leesburg"
    ];

    private static readonly string[] Streets =
        ["Maple", "Oak", "Pine", "Cedar", "Elm", "Birch", "Willow", "Ridge", "Lakeview", "Sunset", "Highland", "Church"];

    private static readonly string[] StreetSuffixes = ["St", "Ave", "Rd", "Ln", "Dr", "Ct"];

    private static readonly string[] HomeStyles =
        ["Bright condo", "Cozy starter home", "Spacious family home", "Updated townhome", "Quiet single-family home"];

    private static readonly string[] Features =
        ["a renovated kitchen", "hardwood floors", "a fenced yard", "a two-car garage", "a community pool", "walkable access to Metro"];

    private static readonly string[] PetPolicies =
        ["Pet friendly.", "Pets welcome.", "Pets allowed.", "No pets.", string.Empty];

    private static readonly string[] Statuses =
        ["active", "active", "active", "active", "active", "active", "active", "active", "pending", "pending", "sold"];

    private static readonly decimal[] BasePriceByBedrooms = [0m, 250_000m, 380_000m, 520_000m, 680_000m, 850_000m];

    private static readonly decimal[] Bathrooms = [1m, 1.5m, 2m, 2.5m, 3m];

    public static IReadOnlyList<Listing> Generate(int fillerCount, DateOnly today)
    {
        var listings = new List<Listing>();
        listings.AddRange(PriceLesson(today));
        listings.AddRange(AgeLesson(today));
        listings.AddRange(MixLesson(today));
        listings.AddRange(Filler(Math.Max(0, fillerCount), today));

        return listings;
    }

    // Every listing is listed on the same day, so only the price differs.
    private static IEnumerable<Listing> PriceLesson(DateOnly today)
    {
        var multipliers = new[] { 0.5m, 0.8m, 1.0m, 1.1m, 1.2m, 1.5m, 2.0m };

        return multipliers.Select((multiplier, index) => Lesson(
            externalId: $"PRICE-{index + 1}",
            city: PriceLessonCity,
            price: LessonBudget * multiplier,
            daysOld: 10,
            today,
            description: FormattableString.Invariant($"Price lesson: priced at {multiplier:0.0#}x of a {BudgetText} target budget.")));
    }

    // Every listing has the same price, so only the age differs.
    private static IEnumerable<Listing> AgeLesson(DateOnly today)
    {
        var ages = new[] { 1, 15, 30, 60, 120, 365 };

        return ages.Select((age, index) => Lesson(
            externalId: $"AGE-{index + 1}",
            city: AgeLessonCity,
            price: LessonBudget,
            daysOld: age,
            today,
            description: $"Age lesson: listed {age} days ago at exactly the {BudgetText} target budget."));
    }

    // Price and age pull in opposite directions.
    private static IEnumerable<Listing> MixLesson(DateOnly today) =>
    [
        Lesson("MIX-1", MixLessonCity, LessonBudget, 120, today,
            $"Mix lesson: exactly on the {BudgetText} budget, but listed 120 days ago."),
        Lesson("MIX-2", MixLessonCity, LessonBudget * 1.2m, 1, today,
            "Mix lesson: 20% over budget, but listed yesterday."),
        Lesson("MIX-3", MixLessonCity, LessonBudget * 0.8m, 30, today,
            "Mix lesson: 20% under budget, listed 30 days ago."),
        Lesson("MIX-4", MixLessonCity, LessonBudget * 1.5m, 0, today,
            "Mix lesson: 50% over budget, listed today.")
    ];

    private static Listing Lesson(string externalId, string city, decimal price, int daysOld, DateOnly today, string description) => new()
    {
        Source = LessonSource,
        ExternalId = ExternalIdPrefix + externalId,
        Address = $"{externalId} Lesson Way",
        City = city,
        State = "VA",
        Zip = "22000",
        Price = price,
        Bedrooms = 3,
        Bathrooms = 2m,
        Sqft = 1800,
        Latitude = 38.9,
        Longitude = -77.2,
        ListedDate = today.AddDays(-daysOld),
        Status = "active",
        Description = description
    };

    private static IEnumerable<Listing> Filler(int count, DateOnly today)
    {
        var random = new Random(FillerSeed);

        for (var number = 1; number <= count; number++)
        {
            var bedrooms = random.Next(1, 6);
            var price = Math.Round(BasePriceByBedrooms[bedrooms] * (decimal)(0.8 + random.NextDouble() * 0.5) / 1_000m) * 1_000m;

            yield return new Listing
            {
                Source = number % 2 == 0 ? "MLS_A" : "MLS_B",
                ExternalId = $"{ExternalIdPrefix}{number:0000}",
                Address = $"{random.Next(10, 999)} {Pick(random, Streets)} {Pick(random, StreetSuffixes)}",
                City = Pick(random, FillerCities),
                State = "VA",
                Zip = $"22{random.Next(0, 200):000}",
                Price = price,
                Bedrooms = bedrooms,
                Bathrooms = Pick(random, Bathrooms.Where(b => b <= bedrooms + 1).ToArray()),
                Sqft = bedrooms * 450 + random.Next(200, 600),
                Latitude = Math.Round(38.7 + random.NextDouble() * 0.4, 4),
                Longitude = Math.Round(-77.5 + random.NextDouble() * 0.5, 4),
                ListedDate = today.AddDays(-random.Next(0, FillerMaxAgeInDays + 1)),
                Status = Pick(random, Statuses),
                Description = $"{Pick(random, HomeStyles)} with {Pick(random, Features)}. {Pick(random, PetPolicies)}".Trim()
            };
        }
    }

    private static T Pick<T>(Random random, T[] items) => items[random.Next(items.Length)];
}
