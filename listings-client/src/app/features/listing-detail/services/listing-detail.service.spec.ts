import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ListingDetail } from '../models/listing-detail.model';
import { createListingDetail } from '../testing/listing-detail-factory';
import { ListingDetailService } from './listing-detail.service';

describe('ListingDetailService', () => {
  let service: ListingDetailService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ListingDetailService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the listing by id', () => {
    service.get(7).subscribe();

    const request = http.expectOne('/api/listings/7');
    expect(request.request.method).toBe('GET');
    request.flush(createListingDetail());
  });

  it('returns the listing from the API', () => {
    const body = createListingDetail({ id: 9, address: '55 Elm Ct' });
    let received: ListingDetail | undefined;

    service.get(9).subscribe(listing => (received = listing));

    http.expectOne('/api/listings/9').flush(body);
    expect(received).toEqual(body);
  });
});
