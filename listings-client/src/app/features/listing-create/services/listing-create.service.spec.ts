import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ListingInput } from '../../../shared/listing-form/listing-form.model';
import { CreatedListing } from '../models/created-listing.model';
import { ListingCreateService } from './listing-create.service';

const input: ListingInput = {
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
  description: 'Bright condo.'
};

describe('ListingCreateService', () => {
  let service: ListingCreateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ListingCreateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the listing and returns the created listing', () => {
    let created: CreatedListing | undefined;

    service.create(input).subscribe(listing => (created = listing));

    const request = http.expectOne('/api/listings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    request.flush({ ...input, id: 301, source: 'MANUAL', externalId: 'abc' });
    expect(created?.id).toBe(301);
  });
});
