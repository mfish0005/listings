using Microsoft.AspNetCore.Mvc;

namespace Listings.Api.Infrastructure;

public static class ValidationProblemFactory
{
    private const string ProblemJsonContentType = "application/problem+json";

    public static ObjectResult CreateResult(IDictionary<string, string[]> errors)
    {
        var problem = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Invalid search request",
            Detail = string.Join(" ", errors.Values.SelectMany(messages => messages))
        };

        var result = new ObjectResult(problem) { StatusCode = StatusCodes.Status400BadRequest };
        result.ContentTypes.Add(ProblemJsonContentType);

        return result;
    }
}
