import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ListingRecord } from '../models/listing-record.model';
import { createListingRecord } from '../testing/listing-record-factory';
import { ListingEditService } from './listing-edit.service';

describe('ListingEditService', () => {
  let service: ListingEditService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ListingEditService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the listing by id', () => {
    const body = createListingRecord({ id: 9 });
    let received: ListingRecord | undefined;

    service.get(9).subscribe(listing => (received = listing));

    const request = http.expectOne('/api/listings/9');
    expect(request.request.method).toBe('GET');
    request.flush(body);
    expect(received).toEqual(body);
  });

  it('puts the whole listing to its id', () => {
    const { id, source, externalId, ...input } = createListingRecord({ id: 7, address: '9 Elm Ct' });
    let received: ListingRecord | undefined;

    service.update(id, input).subscribe(listing => (received = listing));

    const request = http.expectOne('/api/listings/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(input);
    expect(request.request.body.id).toBeUndefined();
    expect(request.request.body.source).toBeUndefined();
    request.flush({ ...input, id, source, externalId });
    expect(received?.address).toBe('9 Elm Ct');
  });
});
