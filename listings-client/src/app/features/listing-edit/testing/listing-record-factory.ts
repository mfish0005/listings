import { ListingRecord } from '../models/listing-record.model';

export function createListingRecord(overrides: Partial<ListingRecord> = {}): ListingRecord {
  return {
    id: 7,
    source: 'MLS_A',
    externalId: 'A1',
    address: '123 Main St',
    city: 'Springfield',
    state: 'VA',
    zip: '22150',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1800,
    latitude: 38.7893,
    longitude: -77.1873,
    listedDate: '2026-08-29',
    status: 'active',
    description: 'Bright top-floor condo near shops and transit.',
    ...overrides
  };
}
