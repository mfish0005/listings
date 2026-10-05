namespace Listings.Services.Scoring;

public record ScoringOptions
{
    public double BudgetWeight { get; init; } = 0.7;
    public double RecencyWeight { get; init; } = 0.3;
    public double RecencyScaleDays { get; init; } = 30;
    public double UnderBudgetSlope { get; init; } = 0.5;
    public int Decimals { get; init; } = 4;
}
