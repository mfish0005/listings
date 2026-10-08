import { ParamMap } from '@angular/router';
import { emptyFilters, ListingSearchFilters, ListingSearchQuery, textFilterKeys } from '../models/listing-search-query.model';

const firstPage = 1;

export function toQueryString(query: ListingSearchQuery): Record<string, string> {
  const params: Record<string, string> = {};

  for (const key of textFilterKeys) {
    const value = query[key].trim();

    if (value) {
      params[key] = value;
    }
  }

  if (query.includeDuplicates) {
    params['includeDuplicates'] = 'true';
  }

  if (query.page > firstPage) {
    params['page'] = String(query.page);
  }

  return params;
}

export function fromParamMap(paramMap: ParamMap): ListingSearchQuery {
  const filters = { ...emptyFilters };

  for (const key of textFilterKeys) {
    filters[key] = paramMap.get(key) ?? '';
  }

  filters.includeDuplicates = paramMap.get('includeDuplicates') === 'true';

  return { ...filters, page: parsePage(paramMap.get('page')) };
}

export function withFilters(filters: ListingSearchFilters, page = firstPage): ListingSearchQuery {
  return { ...filters, page };
}

function parsePage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page >= firstPage ? page : firstPage;
}
