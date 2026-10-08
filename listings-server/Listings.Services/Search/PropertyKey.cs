using System.Text.RegularExpressions;

namespace Listings.Services.Search;

public static partial class PropertyKey
{
    private static readonly Dictionary<string, string> Expansions = new()
    {
        ["st"] = "street",
        ["ave"] = "avenue",
        ["blvd"] = "boulevard",
        ["rd"] = "road",
        ["dr"] = "drive",
        ["ln"] = "lane",
        ["ct"] = "court",
        ["cir"] = "circle",
        ["pl"] = "place",
        ["ter"] = "terrace",
        ["pkwy"] = "parkway",
        ["hwy"] = "highway",
        ["n"] = "north",
        ["s"] = "south",
        ["e"] = "east",
        ["w"] = "west",
        ["ne"] = "northeast",
        ["nw"] = "northwest",
        ["se"] = "southeast",
        ["sw"] = "southwest"
    };

    public static string For(string address, string city, string state)
    {
        var (street, unit) = SplitUnit(Simplify(address));

        return string.Join('|', ExpandAbbreviations(street), unit, Simplify(city), Simplify(state));
    }

    private static (string Street, string Unit) SplitUnit(string address)
    {
        var match = UnitPattern().Match(address);

        return match.Success
            ? (address[..match.Index].Trim(), match.Groups["unit"].Value)
            : (address, string.Empty);
    }

    private static string ExpandAbbreviations(string street) =>
        string.Join(' ', street.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(word => Expansions.GetValueOrDefault(word, word)));

    private static string Simplify(string value) =>
        string.Join(' ', NotLetterDigitOrHash().Replace(value.ToLowerInvariant(), " ").Split(' ', StringSplitOptions.RemoveEmptyEntries));

    [GeneratedRegex("[^a-z0-9#]")]
    private static partial Regex NotLetterDigitOrHash();

    // A unit is a number (optionally with a letter) or a single letter, so a street such as "Apt Way" is not mistaken for one.
    [GeneratedRegex(@"(?:\b(?:apt|apartment|unit|suite|ste)\b|#)\s*(?<unit>(?=[a-z0-9]*\d)[a-z0-9]+|[a-z])$")]
    private static partial Regex UnitPattern();
}
