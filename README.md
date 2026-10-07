# Listings

A listing search application built with a .NET 9 Web API and an Angular 20 UI. Users filter property listings, rank them against a target budget and recency, and page through the results. The UI is built on a custom component and style library (Fish UI).

## Project Overview

- **Backend**: ASP.NET Core Web API (.NET 9) with a layered structure
- **Frontend**: Angular 20 with standalone components and signals
- **Database**: SQL Server in Docker with Entity Framework Core, migrated and seeded on startup
- **Component Library**: Fish UI, with a Fish Styles theming layer
- **Documentation**: Swagger for the API, the Aquarium app for the component library

## Features

- **Filters**: `minPrice`, `maxPrice`, `minBedrooms`, `city`, and a free-text `keyword` matched against the description
- **Ranking**: a relevance score from `targetBudget` and listing recency (see [Scoring](#scoring))
- **Pagination**: numbered pager with a configurable page size
- **UI states**: loading, no results, and error states. Server validation messages are shown to the user
- **Shareable searches**: filters and page live in the URL, so refresh and back/forward work
- **Invalid input**: `minPrice` above `maxPrice`, a `pageSize` outside 1–100, a non-positive `targetBudget`, negative prices or bedrooms, and a `page` below 1 return `400` with Problem Details. A valid search that matches nothing, including an unknown city, returns `200` with an empty page, and the UI says that nothing matched.

## Scoring

Each result gets a relevance score from 0 to 1, rounded to 4 decimal places. When the user supplies a `targetBudget`, the score is how close the price is to that budget, blended with how recently the listing went live. The weights live in `ScoringOptions` (`listings-server/Listings.Services/Scoring`).

**Budget fit** weighs 0.7, and is calculated only when a budget is set. Let `ratio = price / targetBudget`.

- At the budget, fit is 1.
- Under the budget, fit is `1 - 0.5 * (1 - ratio)`. A home at half the budget scores 0.75. A lower price is a mild penalty, because the buyer can still afford it.
- Over the budget, fit is `max(0, 2 - ratio)`. It falls in a straight line and reaches 0 at twice the budget. A home 20% over the budget scores 0.8, while a home 20% under scores 0.9.

**Recency** weighs 0.3, and is the whole score when no budget is given: `1 / (1 + ageInDays / 30)`. Listed today scores 1. Listed 30 days ago scores 0.5. Older listings approach 0 and never reach it, so a very old listing can still surface when nothing newer fits. A future `listedDate` is treated as today.

With a budget, `relevance = 0.7 * budgetFit + 0.3 * recency`. Without one, `relevance = recency` and `budgetFit` is omitted.

Ties break in this order: higher relevance, newer `listedDate`, lower price, then `source` and the feed id. Feed ids are unique per source, not across sources, so two feeds can both describe the same home and both stay in the results. The last two keys keep that order stable.

Trade-offs:

- Budget outweighs recency because a search with a target budget is about whether the buyer can afford the home. Recency separates homes that fit about equally. Both weights are constants in `ScoringOptions`.
- Going over budget is penalized harder than coming in under it. A symmetric distance would treat $400k and $600k as equal against a $500k budget.
- Recency decays smoothly. A listing from 31 days ago is only slightly behind one from 30 days ago. The 30-day scale matches this sample, where every listing is a few weeks to a couple of months old.
- Filtering runs in the database. Scoring and paging run in memory on the matches. That is the right shape for 12 listings. A large feed would need the score in the query, so a page does not require loading every match first.

## Managing Listings

Besides search, the API can view, add and edit single listings.

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/api/listings/{id}` | `200` with the listing, or `404` |
| `POST` | `/api/listings` | `201` with the new listing and a `Location` header, or `400` |
| `PUT` | `/api/listings/{id}` | `200` with the updated listing, `400`, or `404` |

`POST` and `PUT` take the same body. `PUT` replaces every editable field, so send the whole listing.

```json
{
  "address": "12 Test Lane",
  "city": "Springfield",
  "state": "VA",
  "zip": "22150",
  "price": 450000,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "sqft": 1800,
  "latitude": 38.78,
  "longitude": -77.18,
  "listedDate": "2026-10-01",
  "status": "active",
  "description": "A bright, freshly painted home."
}
```

- **Required:** every field except `status`, which defaults to `active`. A missing field is reported as missing, not stored as `0`.
- **Limits:** `state` is 2 letters and `zip` is 5 digits, optionally followed by `-` and 4 digits. `price` and `sqft` are greater than 0. `bedrooms` runs from 0 to 20, and `bathrooms` is a whole or half number up to 20. `latitude` is within ±90 and `longitude` within ±180. `listedDate` cannot be in the future. `status` is `active`, `pending` or `sold`. Text is trimmed, `state` is upper-cased and `status` is lower-cased.
- **Errors:** every problem is reported at once, as Problem Details with an `errors` entry per field. Validation runs before the lookup, so an invalid `PUT` to a missing id returns `400`.
- **Identity:** `id`, `source` and `externalId` cannot be changed. A listing created through the API gets `source` `MANUAL` and a generated `externalId`, so it can never collide with a feed listing. Feed listings can be edited like any other.
- **Not included:** deleting listings, and detecting duplicates when adding.

## Architecture

### Backend
```
┌──────────────────┐
│ Listings.Api      ← Controllers, validation responses, Swagger
├──────────────────┤
│ Listings.Services ← Search, scoring, query validation
├──────────────────┤
│ Listings.Data     ← EF Core, migrations, seed data
└──────────────────┘
  Listings.Tests    ← xUnit tests for scoring, validation, search and the controller
```

### Frontend
```
┌─────────────────┐
│  Listings App     ← Search UI (features/listing-search)
├─────────────────┤
│  Aquarium App     ← Component library showcase
├─────────────────┤
│  Fish UI          ← Component library (button, input, pagination, ...)
└─────────────────┘
```

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) 20.19 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Google Chrome (the frontend tests run in headless Chrome)
- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mfish0005/listings
cd listings
```

### 2. Start the Database (Docker)
```bash
cd listings-server
docker-compose up -d
```

Wait about 30 seconds for SQL Server to become healthy. Check with `docker ps`, which should show `listings-sqlserver` as `healthy`.

The container listens on host port **1434** (not 1433), so it can run alongside other SQL Server containers.

### 3. Run the API
```bash
cd listings-server/Listings.Api
dotnet run
```

On startup the API applies the EF Core migrations and seeds the 12 sample listings, but only if the table is empty. There is no separate migration or seed step, and restarting never wipes data you added.

The API is available at `http://localhost:5160`, with Swagger at `http://localhost:5160/swagger`.

### 4. Run the Frontend
```bash
cd listings-client
npm install
npm run serve-listings
```

The listings app is available at `http://localhost:4200`. Its dev server proxies `/api` to `http://localhost:5160` (see `proxy.conf.json`), so no CORS setup is needed.

To browse the component library:
```bash
npm run build-fish-ui
npm run serve-aquarium
```

The Aquarium app is available at `http://localhost:4201`. It consumes the built library, so `build-fish-ui` must be run first, and again after changing library code.

## Demo Data and Example Searches

The sample feed has 12 listings, which is too few to see the pager on a filtered search. An opt-in setting adds more, and it also adds three small groups of listings that make the scoring easy to follow.

### Turning it on

Set `Seed:DemoListings` to the number of extra filler listings you want. It defaults to `0`. Any one of these works, followed by a restart of the API:

```bash
dotnet run -- --Seed:DemoListings=300
```

```bash
Seed__DemoListings=300 dotnet run
```

Or edit the `Seed` section of `listings-server/Listings.Api/appsettings.json`.

- The demo rows are the three lesson groups (17 listings) plus the filler. Every demo row has an external id starting with `DEMO-`.
- The filler is deterministic. It spreads across 15 Virginia cities, with varied bedrooms, prices, ages and pet wording, so city, bedroom, price and keyword searches all return several pages.
- Restarting with the same number changes nothing. A different number replaces the `DEMO-` rows and leaves the sample feed alone. Setting `0` removes them.
- Demo dates are measured from the day the rows were created. Change the number (for example `301`) to rebuild them with fresh dates.

### Scoring lessons

Each lesson lives in its own city, so a city search isolates it. Enter the city and a **target budget of 500000** in the UI. Every listing's description says what it is testing.

**Budgetville: price only.** All seven are listed 10 days ago, so recency is the same for each and only the price changes.

| Rank | Price | Budget fit | Score | Why |
| --- | --- | --- | --- | --- |
| 1 | $500,000 (1.0×) | 1.00 | 0.925 | Exactly on budget. |
| 2 | $400,000 (0.8×) | 0.90 | 0.855 | Under budget is a mild penalty. |
| 3 | $550,000 (1.1×) | 0.90 | 0.855 | Ties with the row above. The cheaper home wins the tie. |
| 4 | $600,000 (1.2×) | 0.80 | 0.785 | Over budget falls faster. |
| 5 | $250,000 (0.5×) | 0.75 | 0.750 | Half the budget loses 0.25 of fit, slightly more than 1.2× over loses (0.20). |
| 6 | $750,000 (1.5×) | 0.50 | 0.575 | |
| 7 | $1,000,000 (2.0×) | 0.00 | 0.225 | Twice the budget scores zero fit. Only recency is left. |

**Agetown: age only.** All six cost exactly $500,000, so budget fit is 1 and only the age changes. The order is newest first, with or without a budget.

| Rank | Listed | Recency | Score with budget |
| --- | --- | --- | --- |
| 1 | 1 day ago | 0.9677 | 0.9903 |
| 2 | 15 days ago | 0.6667 | 0.9000 |
| 3 | 30 days ago | 0.5000 | 0.8500 |
| 4 | 60 days ago | 0.3333 | 0.8000 |
| 5 | 120 days ago | 0.2000 | 0.7600 |
| 6 | 365 days ago | 0.0759 | 0.7228 |

Try it without a budget as well. The score is then just the recency column.

**Balanceburg: price and age pull in opposite directions.**

| Rank | Listing | Budget fit | Recency | Score |
| --- | --- | --- | --- | --- |
| 1 | 1.2× budget, listed yesterday | 0.80 | 0.9677 | 0.8503 |
| 2 | 0.8× budget, listed 30 days ago | 0.90 | 0.5000 | 0.7800 |
| 3 | On budget, listed 120 days ago | 1.00 | 0.2000 | 0.7600 |
| 4 | 1.5× budget, listed today | 0.50 | 1.0000 | 0.6500 |

The listing that is 20% over budget but listed yesterday beats the one that is exactly on budget but four months old. That is the 0.7 and 0.3 weighting at work. Without a budget the order flips to pure age: today, yesterday, 30 days, 120 days. This is the only lesson whose order drifts as real days pass, because the recency gaps shrink over time.

### Paging with filters

With 300 filler listings, these searches return several pages. Try them together with a target budget and watch the page count change:

- `city=Springfield` for about 20 listings.
- `minBedrooms=3` for most of the set.
- `keyword=pet`, which matches any description containing "pet", including "No pets".
- `minBedrooms=2` with `maxPrice=550000`, which narrows to the mid range.

The tests for all of this are in `listings-server/Listings.Tests/Seed`. They run each lesson search through the real search service with a fixed clock and assert the orderings above.

## Connecting to the Database

| Setting  | Value                |
|----------|----------------------|
| Server   | `localhost,1434`     |
| Login    | `sa`                 |
| Password | `Listings123!`       |
| Database | `ListingsDb`         |
| Options  | Trust server certificate |

The password defaults to `Listings123!`. To change it, set `SA_PASSWORD` before `docker-compose up` and update the connection string in `Listings.Api/appsettings.json` to match. Changing it after the volume exists requires `docker-compose down -v`, which also deletes the data.

## Project Structure

```
listings/
├── listings-server/                # .NET Web API
│   ├── Listings.Api/               # Controllers, Swagger, error handling
│   ├── Listings.Services/          # Search, scoring, validation
│   ├── Listings.Data/              # EF Core, migrations, seed data
│   ├── Listings.Tests/             # xUnit tests
│   └── docker-compose.yml          # SQL Server container
├── listings-client/                # Angular workspace
│   ├── src/                        # Listings app
│   │   └── app/features/listing-search/
│   ├── projects/
│   │   ├── fish-ui/                # Component library and fish-styles
│   │   └── aquarium/               # Component showcase
│   ├── proxy.conf.json             # Dev proxy to the API
│   └── package.json
└── README.md
```

## Component Library

Fish UI provides Button, Card, Badge, Input, Textarea, Select, Search, Spinner, Icon and Pagination. Its styles are themable: an app sets Sass variables, then calls `@include fish-theme-vars;` once in its global styles to publish them as `--fish-*` CSS custom properties that the compiled components read at runtime. See `listings-client/projects/fish-ui/src/styles/fish-styles/docs/theming.md` and the Theming page in the Aquarium app for details.

## Development Commands

### Backend
```bash
# Run the API with hot reload
dotnet watch run --project listings-server/Listings.Api

# Run all backend tests
dotnet test listings-server/Listings.sln

# Add a migration
dotnet ef migrations add MigrationName --project listings-server/Listings.Data --startup-project listings-server/Listings.Api
```

### Frontend
```bash
# Serve the listings app
npm run serve-listings

# Serve the component library showcase
npm run serve-aquarium

# Build everything (library first, then both apps)
npm run build-all

# Run unit tests
npm run test-listings
npm run test-fish-ui
```
