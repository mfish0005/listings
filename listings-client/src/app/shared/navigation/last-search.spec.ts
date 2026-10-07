import { TestBed } from '@angular/core/testing';
import { LastSearch } from './last-search';

describe('LastSearch', () => {
  let lastSearch: LastSearch;

  beforeEach(() => {
    lastSearch = TestBed.inject(LastSearch);
  });

  it('starts with no query params', () => {
    expect(lastSearch.queryParams).toEqual({});
  });

  it('returns the most recently remembered params', () => {
    lastSearch.remember({ city: 'Alexandria', page: '2' });
    lastSearch.remember({ keyword: 'metro' });

    expect(lastSearch.queryParams).toEqual({ keyword: 'metro' });
  });
});
