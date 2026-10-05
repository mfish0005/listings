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
- **Deliberate error handling**: invalid input returns a `400` with Problem Details instead of a crash or a silent empty result

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
