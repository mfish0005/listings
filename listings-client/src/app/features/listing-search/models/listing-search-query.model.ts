export interface ListingSearchTextFilters {
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  city: string;
  keyword: string;
  targetBudget: string;
  pageSize: string;
}

export interface ListingSearchFilters extends ListingSearchTextFilters {
  includeDuplicates: boolean;
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
  pageSize: '',
  includeDuplicates: false
};

export const textFilterKeys: (keyof ListingSearchTextFilters)[] = [
  'minPrice',
  'maxPrice',
  'minBedrooms',
  'city',
  'keyword',
  'targetBudget',
  'pageSize'
];
