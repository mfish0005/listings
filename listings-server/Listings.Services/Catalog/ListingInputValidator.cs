using System.Text.RegularExpressions;
using Listings.Data.Entities;
using Listings.Services.Models;

namespace Listings.Services.Catalog;

public partial class ListingInputValidator(TimeProvider timeProvider)
{
    [GeneratedRegex(@"^[A-Za-z]{2}$")]
    private static partial Regex StatePattern();

    [GeneratedRegex(@"^\d{5}(-\d{4})?$")]
    private static partial Regex ZipPattern();

    public IReadOnlyList<ListingQueryError> Validate(ListingInput input)
    {
        var errors = new List<ListingQueryError>();

        ValidateText(errors, "address", input.Address, ListingInputLimits.AddressMaxLength);
        ValidateText(errors, "city", input.City, ListingInputLimits.CityMaxLength);
        ValidateText(errors, "description", input.Description, ListingInputLimits.DescriptionMaxLength);
        ValidatePattern(errors, "state", input.State, StatePattern(), "state must be a 2-letter code.");
        ValidatePattern(errors, "zip", input.Zip, ZipPattern(), "zip must be 5 digits, optionally followed by a dash and 4 digits.");
        ValidateRange(errors, "price", input.Price, ListingInputLimits.MaxPrice, minExclusive: 0m);
        ValidateRange(errors, "bedrooms", input.Bedrooms, ListingInputLimits.MaxBedrooms, minInclusive: 0);
        ValidateBathrooms(errors, input.Bathrooms);
        ValidateRange(errors, "sqft", input.Sqft, ListingInputLimits.MaxSqft, minExclusive: 0);
        ValidateRange(errors, "latitude", input.Latitude, 90.0, minInclusive: -90.0);
        ValidateRange(errors, "longitude", input.Longitude, 180.0, minInclusive: -180.0);
        ValidateListedDate(errors, input.ListedDate);
        ValidateStatus(errors, input.Status);

        return errors;
    }

    private static void ValidateText(List<ListingQueryError> errors, string field, string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add(new(field, $"{field} is required."));
        }
        else if (value.Trim().Length > maxLength)
        {
            errors.Add(new(field, $"{field} must be {maxLength} characters or fewer."));
        }
    }

    private static void ValidatePattern(List<ListingQueryError> errors, string field, string? value, Regex pattern, string message)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add(new(field, $"{field} is required."));
        }
        else if (!pattern.IsMatch(value.Trim()))
        {
            errors.Add(new(field, message));
        }
    }

    private static void ValidateRange<T>(
        List<ListingQueryError> errors,
        string field,
        T? value,
        T max,
        T? minInclusive = null,
        T? minExclusive = null)
        where T : struct, IComparable<T>
    {
        if (value is not { } number)
        {
            errors.Add(new(field, $"{field} is required."));
            return;
        }

        if (minExclusive is { } lowerBound && number.CompareTo(lowerBound) <= 0)
        {
            errors.Add(new(field, $"{field} must be greater than {lowerBound}."));
        }
        else if (minInclusive is { } lowerLimit && number.CompareTo(lowerLimit) < 0)
        {
            errors.Add(new(field, $"{field} must be {lowerLimit} or greater."));
        }
        else if (number.CompareTo(max) > 0)
        {
            errors.Add(new(field, $"{field} must be {max} or less."));
        }
    }

    private static void ValidateBathrooms(List<ListingQueryError> errors, decimal? bathrooms)
    {
        ValidateRange(errors, "bathrooms", bathrooms, ListingInputLimits.MaxBathrooms, minInclusive: 0m);

        if (bathrooms is { } count && count % 0.5m != 0)
        {
            errors.Add(new("bathrooms", "bathrooms must be a whole or half number, such as 1 or 1.5."));
        }
    }

    private void ValidateListedDate(List<ListingQueryError> errors, DateOnly? listedDate)
    {
        if (listedDate is not { } date)
        {
            errors.Add(new("listedDate", "listedDate is required."));
        }
        else if (date > DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime))
        {
            errors.Add(new("listedDate", "listedDate cannot be in the future."));
        }
    }

    private static void ValidateStatus(List<ListingQueryError> errors, string? status)
    {
        if (!string.IsNullOrWhiteSpace(status) && !ListingStatuses.All.Contains(status.Trim().ToLowerInvariant()))
        {
            errors.Add(new("status", $"status must be one of: {string.Join(", ", ListingStatuses.All)}."));
        }
    }
}
