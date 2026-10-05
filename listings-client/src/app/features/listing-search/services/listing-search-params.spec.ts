import { convertToParamMap } from '@angular/router';
import { emptyFilters, ListingSearchQuery } from '../models/listing-search-query.model';
import { fromParamMap, toQueryString, withFilters } from './listing-search-params';

describe('listing search params', () => {
  describe('toQueryString', () => {
    it('omits blank and whitespace-only filters', () => {
      const query: ListingSearchQuery = { ...emptyFilters, city: '   ', keyword: '', page: 1 };

      expect(toQueryString(query)).toEqual({});
    });

    it('trims values and keeps them as text', () => {
      const query: ListingSearchQuery = { ...emptyFilters, city: '  Springfield ', minPrice: ' 300000 ', page: 1 };

      expect(toQueryString(query)).toEqual({ city: 'Springfield', minPrice: '300000' });
    });

    it('passes non-numeric input through so the server can reject it', () => {
      const query: ListingSearchQuery = { ...emptyFilters, minPrice: 'abc', page: 1 };

      expect(toQueryString(query)).toEqual({ minPrice: 'abc' });
    });

    it('leaves out the first page and includes later pages', () => {
      expect(toQueryString({ ...emptyFilters, page: 1 })).toEqual({});
      expect(toQueryString({ ...emptyFilters, page: 3 })).toEqual({ page: '3' });
    });
  });

  describe('fromParamMap', () => {
    it('reads filters and page from the query string', () => {
      const query = fromParamMap(convertToParamMap({ city: 'Vienna', targetBudget: '450000', page: '2' }));

      expect(query).toEqual({ ...emptyFilters, city: 'Vienna', targetBudget: '450000', page: 2 });
    });

    it('defaults to the first page and empty filters', () => {
      expect(fromParamMap(convertToParamMap({}))).toEqual({ ...emptyFilters, page: 1 });
    });

    it('falls back to the first page for an unusable page value', () => {
      for (const page of ['0', '-2', 'abc', '1.5']) {
        expect(fromParamMap(convertToParamMap({ page })).page).toBe(1);
      }
    });
  });

  describe('withFilters', () => {
    it('starts at the first page unless told otherwise', () => {
      expect(withFilters(emptyFilters).page).toBe(1);
      expect(withFilters(emptyFilters, 4).page).toBe(4);
    });
  });
});
