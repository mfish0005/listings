using Listings.Services.Catalog;
using Listings.Services.Models;
using Listings.Tests.Helpers;

namespace Listings.Tests.Catalog;

public class ListingInputValidatorTests
{
    private readonly ListingInputValidator _validator = new(TestClock.Create());

    private static ListingInput Valid() => ListingInputFactory.Valid();

    private string[] ErrorFields(ListingInput input) =>
        _validator.Validate(input).Select(error => error.Field).Distinct().ToArray();

    [Fact]
    public void ValidInput_HasNoErrors()
    {
        Assert.Empty(_validator.Validate(Valid()));
    }

    [Fact]
    public void EmptyInput_ReportsEveryRequiredField_ExceptStatus()
    {
        var fields = ErrorFields(new ListingInput());

        Assert.Equal(
            ["address", "city", "description", "state", "zip", "price", "bedrooms", "bathrooms", "sqft", "latitude", "longitude", "listedDate"],
            fields);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void BlankText_IsTreatedAsMissing(string blank)
    {
        var fields = ErrorFields(Valid() with { Address = blank, City = blank, Description = blank });

        Assert.Equal(["address", "city", "description"], fields);
    }

    [Fact]
    public void TextAtTheMaxLength_IsAccepted_AndOneOverIsRejected()
    {
        Assert.Empty(_validator.Validate(Valid() with { Address = new string('a', ListingInputLimits.AddressMaxLength) }));
        Assert.Equal(["address"], ErrorFields(Valid() with { Address = new string('a', ListingInputLimits.AddressMaxLength + 1) }));
    }

    [Fact]
    public void TextLengthIgnoresSurroundingWhitespace()
    {
        var padded = "  " + new string('a', ListingInputLimits.AddressMaxLength) + "  ";

        Assert.Empty(_validator.Validate(Valid() with { Address = padded }));
    }

    [Theory]
    [InlineData("VA", true)]
    [InlineData("va", true)]
    [InlineData("V", false)]
    [InlineData("VAA", false)]
    [InlineData("V1", false)]
    public void State_MustBeTwoLetters(string state, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { State = state }).Contains("state"));
    }

    [Theory]
    [InlineData("22150", true)]
    [InlineData("22150-1234", true)]
    [InlineData("2215", false)]
    [InlineData("221500", false)]
    [InlineData("22150-12", false)]
    [InlineData("ABCDE", false)]
    public void Zip_MustBeFiveDigitsWithOptionalPlusFour(string zip, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Zip = zip }).Contains("zip"));
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(-1, false)]
    [InlineData(0.01, true)]
    [InlineData(1_000_000_000, true)]
    [InlineData(1_000_000_001, false)]
    public void Price_MustBePositiveAndWithinTheLimit(double price, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Price = (decimal)price }).Contains("price"));
    }

    [Theory]
    [InlineData(-1, false)]
    [InlineData(0, true)]
    [InlineData(20, true)]
    [InlineData(21, false)]
    public void Bedrooms_AllowsStudiosUpToTheLimit(int bedrooms, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Bedrooms = bedrooms }).Contains("bedrooms"));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(1, true)]
    [InlineData(1.5, true)]
    [InlineData(1.25, false)]
    [InlineData(-0.5, false)]
    [InlineData(20.5, false)]
    public void Bathrooms_MustBeWholeOrHalfNumbers(double bathrooms, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Bathrooms = (decimal)bathrooms }).Contains("bathrooms"));
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(1, true)]
    [InlineData(1_000_000, true)]
    [InlineData(1_000_001, false)]
    public void Sqft_MustBePositiveAndWithinTheLimit(int sqft, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Sqft = sqft }).Contains("sqft"));
    }

    [Theory]
    [InlineData(-90, true)]
    [InlineData(90, true)]
    [InlineData(-90.1, false)]
    [InlineData(90.1, false)]
    public void Latitude_MustBeWithinTheGlobe(double latitude, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Latitude = latitude }).Contains("latitude"));
    }

    [Theory]
    [InlineData(-180, true)]
    [InlineData(180, true)]
    [InlineData(-180.1, false)]
    [InlineData(180.1, false)]
    public void Longitude_MustBeWithinTheGlobe(double longitude, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Longitude = longitude }).Contains("longitude"));
    }

    [Fact]
    public void ListedDate_CanBeTodayButNotTomorrow()
    {
        Assert.Empty(_validator.Validate(Valid() with { ListedDate = TestClock.Today }));
        Assert.Equal(["listedDate"], ErrorFields(Valid() with { ListedDate = TestClock.Today.AddDays(1) }));
    }

    [Theory]
    [InlineData("active", true)]
    [InlineData("Pending", true)]
    [InlineData(" SOLD ", true)]
    [InlineData(null, true)]
    [InlineData("", true)]
    [InlineData("withdrawn", false)]
    public void Status_IsOptionalButMustBeKnownWhenGiven(string? status, bool isValid)
    {
        Assert.Equal(isValid, !ErrorFields(Valid() with { Status = status }).Contains("status"));
    }

    [Fact]
    public void Status_ErrorListsTheAllowedValues()
    {
        var error = Assert.Single(_validator.Validate(Valid() with { Status = "withdrawn" }));

        Assert.Equal("status must be one of: active, pending, sold.", error.Message);
    }
}
