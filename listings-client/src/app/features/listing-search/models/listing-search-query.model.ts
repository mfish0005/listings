export interface ListingSearchFilters {
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  city: string;
  keyword: string;
  targetBudget: string;
  pageSize: string;
}

export interface ListingSearchQuery extends ListingSearchFilters {
  page: number;
}

export const emptyFilters: ListingSearchFilters = {
  minPrice: '',
  maxPrice: '',
  minBedrooms: '',
  city: '',
  keyword: '',
  targetBudget: '',
  pageSize: ''
};

export const filterKeys = Object.keys(emptyFilters) as (keyof ListingSearchFilters)[];
