export interface ListingAlternate {
  id: number;
  source: string;
  externalId: string;
  price: number;
  listedDate: string;
}

export interface Listing {
  id: number;
  source: string;
  externalId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  status: string;
  description: string;
  relevanceScore: number;
  budgetFit: number | null;
  recency: number;
  alsoListedBy: ListingAlternate[];
}

export interface PagedResult<T> {
  results: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
