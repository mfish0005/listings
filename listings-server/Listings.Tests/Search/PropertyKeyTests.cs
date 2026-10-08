using Listings.Services.Search;

namespace Listings.Tests.Search;

public class PropertyKeyTests
{
    private static string Key(string address, string city = "Springfield", string state = "VA") =>
        PropertyKey.For(address, city, state);

    [Theory]
    [InlineData("123 Main St, Apt 4B", "123 Main Street, Unit 4B")]
    [InlineData("456 Oak Ave", "456 Oak Avenue")]
    [InlineData("55 Elm Ct", "55 Elm Court")]
    [InlineData("789 Pine Rd", "789 Pine Road")]
    [InlineData("22 Birch Ln", "22 Birch Lane")]
    [InlineData("300 Cedar Blvd", "300 Cedar Boulevard")]
    [InlineData("100 Maple Dr", "100 Maple Drive")]
    public void TheSameAddress_WrittenWithAnAbbreviation_HasTheSameKey(string abbreviated, string spelledOut)
    {
        Assert.Equal(Key(abbreviated), Key(spelledOut));
    }

    [Theory]
    [InlineData("55 ELM COURT")]
    [InlineData("  55   Elm   Court  ")]
    [InlineData("55 Elm Ct.")]
    [InlineData("55, Elm Court,")]
    public void CaseSpacingAndPunctuation_AreIgnored(string messy)
    {
        Assert.Equal(Key("55 Elm Court"), Key(messy));
    }

    [Theory]
    [InlineData("123 Main St, Apt 4B")]
    [InlineData("123 Main St Unit 4b")]
    [InlineData("123 Main St, #4B")]
    [InlineData("123 Main St # 4B")]
    [InlineData("123 Main Street, Suite 4B")]
    [InlineData("123 Main St Ste 4B")]
    [InlineData("123 Main St Apartment 4B")]
    public void EveryWayOfWritingAUnit_HasTheSameKey(string address)
    {
        Assert.Equal(Key("123 Main St, Apt 4B"), Key(address));
    }

    [Fact]
    public void Directions_AreSpelledOut()
    {
        Assert.Equal(Key("100 N Main St"), Key("100 North Main Street"));
        Assert.Equal(Key("100 SW Main St"), Key("100 Southwest Main Street"));
    }

    [Fact]
    public void DifferentUnitsInTheSameBuilding_AreDifferentHomes()
    {
        Assert.NotEqual(Key("123 Main St, Apt 4B"), Key("123 Main St, Apt 5C"));
    }

    [Fact]
    public void AHomeWithAUnit_IsNotTheSameAsTheBuildingWithout()
    {
        Assert.NotEqual(Key("123 Main St, Apt 4B"), Key("123 Main St"));
    }

    [Fact]
    public void DifferentStreetNumbersOrNames_AreDifferentHomes()
    {
        Assert.NotEqual(Key("123 Main St"), Key("124 Main St"));
        Assert.NotEqual(Key("123 Main St"), Key("123 Maple St"));
    }

    [Fact]
    public void TheSameAddressInADifferentCity_IsADifferentHome()
    {
        Assert.NotEqual(Key("123 Main St", city: "Springfield"), Key("123 Main St", city: "Fairfax"));
    }

    [Fact]
    public void TheSameAddressInADifferentState_IsADifferentHome()
    {
        Assert.NotEqual(Key("123 Main St", state: "VA"), Key("123 Main St", state: "IL"));
    }

    [Fact]
    public void CityAndState_IgnoreCaseAndSpacing()
    {
        Assert.Equal(Key("123 Main St", "Falls Church", "VA"), Key("123 Main St", "  falls   CHURCH ", "va"));
    }

    [Fact]
    public void AStreetCalledAptWay_IsNotMistakenForAUnit()
    {
        Assert.NotEqual(Key("12 Apt Way"), Key("12 Way"));
    }
}
