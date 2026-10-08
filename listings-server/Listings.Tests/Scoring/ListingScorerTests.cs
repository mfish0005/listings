using Listings.Services.Scoring;
using Listings.Tests.Helpers;

namespace Listings.Tests.Scoring;

public class ListingScorerTests
{
    private const int Precision = 4;
    private const decimal Budget = 500_000;

    private readonly ListingScorer _scorer = new(new ScoringOptions(), TestClock.Create());

    private static DateOnly DaysAgo(int days) => TestClock.Today.AddDays(-days);

    [Fact]
    public void Recency_IsOne_WhenListedToday()
    {
        var score = _scorer.Score(Budget, DaysAgo(0), null);

        Assert.Equal(1.0, score.Recency, Precision);
    }

    [Fact]
    public void Recency_IsHalf_WhenListed30DaysAgo()
    {
        var score = _scorer.Score(Budget, DaysAgo(30), null);

        Assert.Equal(0.5, score.Recency, Precision);
    }

    [Fact]
    public void Recency_IsHigherForNewerListings()
    {
        var older = _scorer.Score(Budget, DaysAgo(40), null);
        var newer = _scorer.Score(Budget, DaysAgo(10), null);

        Assert.True(newer.Recency > older.Recency);
    }

    [Fact]
    public void Recency_IsCappedAtOne_ForFutureDatedListings()
    {
        var score = _scorer.Score(Budget, DaysAgo(-10), null);

        Assert.Equal(1.0, score.Recency, Precision);
    }

    [Fact]
    public void BudgetFit_IsOne_WhenPriceEqualsBudget()
    {
        var score = _scorer.Score(Budget, DaysAgo(0), Budget);

        Assert.Equal(1.0, score.BudgetFit!.Value, Precision);
    }

    [Fact]
    public void BudgetFit_IsOne_WhenUnderBudget()
    {
        var score = _scorer.Score(250_000, DaysAgo(0), Budget);

        Assert.Equal(1.0, score.BudgetFit!.Value, Precision);
    }

    [Fact]
    public void Relevance_IsTheSame_ForAnyPriceAtOrUnderBudget_WhenListedTheSameDay()
    {
        var cheap = _scorer.Score(250_000, DaysAgo(5), Budget);
        var onBudget = _scorer.Score(Budget, DaysAgo(5), Budget);

        Assert.Equal(onBudget.Relevance, cheap.Relevance);
    }

    [Fact]
    public void BudgetFit_DropsLinearly_WhenOverBudget()
    {
        var score = _scorer.Score(600_000, DaysAgo(0), Budget);

        Assert.Equal(0.8, score.BudgetFit!.Value, Precision);
    }

    [Fact]
    public void BudgetFit_IsZero_WhenPriceIsDoubleTheBudget()
    {
        var score = _scorer.Score(1_000_000, DaysAgo(0), Budget);

        Assert.Equal(0.0, score.BudgetFit!.Value, Precision);
    }

    [Fact]
    public void BudgetFit_NeverGoesNegative_WhenFarOverBudget()
    {
        var score = _scorer.Score(5_000_000, DaysAgo(0), Budget);

        Assert.Equal(0.0, score.BudgetFit!.Value, Precision);
    }

    [Fact]
    public void OverBudget_ScoresLower_ThanSameDistanceUnderBudget()
    {
        var under = _scorer.Score(400_000, DaysAgo(0), Budget);
        var over = _scorer.Score(600_000, DaysAgo(0), Budget);

        Assert.True(under.Relevance > over.Relevance);
    }

    [Fact]
    public void Relevance_EqualsRecency_WhenThereIsNoBudget()
    {
        var score = _scorer.Score(Budget, DaysAgo(30), null);

        Assert.Null(score.BudgetFit);
        Assert.Equal(score.Recency, score.Relevance, Precision);
    }

    [Fact]
    public void Relevance_CombinesBudgetFitAndRecencyByWeight()
    {
        var score = _scorer.Score(Budget, DaysAgo(30), Budget);

        Assert.Equal(0.7 * 1.0 + 0.3 * 0.5, score.Relevance, Precision);
    }

    [Fact]
    public void Relevance_IsRoundedToFourDecimals()
    {
        var score = _scorer.Score(470_000, DaysAgo(31), Budget);

        Assert.Equal(Math.Round(score.Relevance, 4), score.Relevance);
    }

    [Fact]
    public void Scoring_IsDeterministic()
    {
        var first = _scorer.Score(470_000, DaysAgo(31), Budget);
        var second = _scorer.Score(470_000, DaysAgo(31), Budget);

        Assert.Equal(first, second);
    }
}
