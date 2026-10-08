import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { emptyFilters } from '../models/listing-search-query.model';
import { PagedResult, Listing } from '../models/listing.model';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  let service: ListingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ListingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests only the filters that have values', () => {
    service.search({ ...emptyFilters, city: ' Vienna ', minBedrooms: '3', page: 2 }).subscribe();

    const request = http.expectOne(req => req.url === '/api/listings');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys().sort()).toEqual(['city', 'minBedrooms', 'page']);
    expect(request.request.params.get('city')).toBe('Vienna');
    expect(request.request.params.get('page')).toBe('2');
    request.flush({});
  });

  it('asks for duplicate listings only when the option is on', () => {
    service.search({ ...emptyFilters, includeDuplicates: true, page: 1 }).subscribe();

    const request = http.expectOne(req => req.url === '/api/listings');
    expect(request.request.params.get('includeDuplicates')).toBe('true');
    request.flush({});
  });

  it('returns the paged result from the API', () => {
    const body: PagedResult<Listing> = { results: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 0 };
    let received: PagedResult<Listing> | undefined;

    service.search({ ...emptyFilters, page: 1 }).subscribe(result => (received = result));

    http.expectOne('/api/listings').flush(body);
    expect(received).toEqual(body);
  });
});
