namespace Listings.Services.Scoring;

public class ListingScorer(ScoringOptions options, TimeProvider timeProvider)
{
    public ListingScore Score(decimal price, DateOnly listedDate, decimal? targetBudget)
    {
        var recency = CalculateRecency(listedDate);

        if (targetBudget is null)
        {
            return new ListingScore(Round(recency), null, Round(recency));
        }

        var budgetFit = CalculateBudgetFit(price, targetBudget.Value);
        var relevance = options.BudgetWeight * budgetFit + options.RecencyWeight * recency;

        return new ListingScore(Round(relevance), Round(budgetFit), Round(recency));
    }

    private double CalculateRecency(DateOnly listedDate)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);
        var ageInDays = Math.Max(0, today.DayNumber - listedDate.DayNumber);

        return 1 / (1 + ageInDays / options.RecencyScaleDays);
    }

    private double CalculateBudgetFit(decimal price, decimal targetBudget)
    {
        var priceToBudget = (double)(price / targetBudget);

        return priceToBudget <= 1 ? 1 : Math.Max(0, 2 - priceToBudget);
    }

    private double Round(double value) => Math.Round(value, options.Decimals, MidpointRounding.AwayFromZero);
}
