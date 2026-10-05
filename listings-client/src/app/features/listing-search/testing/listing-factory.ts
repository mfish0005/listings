import { Listing, PagedResult } from '../models/listing.model';

export function createListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1,
    source: 'MLS_A',
    externalId: 'A1',
    address: '123 Main St',
    city: 'Springfield',
    state: 'VA',
    zip: '22150',
    price: 450000,
    bedrooms: 2,
    bathrooms: 1.5,
    sqft: 980,
    latitude: 38.78,
    longitude: -77.18,
    listedDate: '2026-08-29',
    status: 'active',
    description: 'Bright top-floor condo.',
    relevanceScore: 0.83,
    budgetFit: 1,
    recency: 0.5,
    ...overrides
  };
}

export function createPage(overrides: Partial<PagedResult<Listing>> = {}): PagedResult<Listing> {
  return {
    results: [createListing()],
    page: 1,
    pageSize: 5,
    totalCount: 1,
    totalPages: 1,
    ...overrides
  };
}
