import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ListingDetail } from '../../models/listing-detail.model';
import { ListingDetailService } from '../../services/listing-detail.service';
import { createListingDetail } from '../../testing/listing-detail-factory';
import { ListingDetailComponent } from './listing-detail.component';

describe('ListingDetailComponent', () => {
  let fixture: ComponentFixture<ListingDetailComponent>;
  let paramMap: BehaviorSubject<ParamMap>;
  let responses: Subject<ListingDetail>[];
  let requestedIds: number[];
  let router: jasmine.SpyObj<Router>;
  let location: { back: jasmine.Spy; getState: jasmine.Spy };

  const detailService = {
    get: (id: number): Observable<ListingDetail> => {
      const response = new Subject<ListingDetail>();
      requestedIds.push(id);
      responses.push(response);
      return response;
    }
  };

  function respondWith(listing: ListingDetail): void {
    responses[responses.length - 1].next(listing);
    fixture.detectChanges();
  }

  function failWith(error: HttpErrorResponse): void {
    responses[responses.length - 1].error(error);
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function find<T extends Element>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }

  beforeEach(async () => {
    requestedIds = [];
    responses = [];
    paramMap = new BehaviorSubject(convertToParamMap({ id: '7' }));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    location = { back: jasmine.createSpy('back'), getState: jasmine.createSpy('getState').and.returnValue({ navigationId: 2 }) };

    await TestBed.configureTestingModule({
      imports: [ListingDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
        { provide: ListingDetailService, useValue: detailService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDetailComponent);
    fixture.detectChanges();
  });

  it('requests the listing named in the route', () => {
    expect(requestedIds).toEqual([7]);
  });

  it('shows a spinner while loading', () => {
    expect(find('fish-spinner')).not.toBeNull();
    expect(find('article')).toBeNull();
  });

  it('shows the address, price and key facts', () => {
    respondWith(createListingDetail({ price: 450000, bedrooms: 3, bathrooms: 2.5, sqft: 1800 }));

    const content = text();
    expect(content).toContain('123 Main St');
    expect(content).toContain('Springfield, VA 22150');
    expect(content).toContain('$450,000');
    expect(content).toContain('3');
    expect(content).toContain('2.5');
    expect(content).toContain('1,800');
    expect(content).toContain('$250');
  });

  it('shows the description, listing date, source and id', () => {
    respondWith(createListingDetail({ description: 'Quiet street, big yard.', externalId: 'B9', source: 'MLS_B' }));

    const content = text();
    expect(content).toContain('Quiet street, big yard.');
    expect(content).toContain('Aug 29, 2026');
    expect(content).toContain('MLS_B');
    expect(content).toContain('B9');
  });

  it('shows a dash instead of a price per square foot when the area is unknown', () => {
    respondWith(createListingDetail({ sqft: 0 }));

    const pricePerSqft = fixture.nativeElement.querySelectorAll('.facts__item')[3] as HTMLElement;
    expect(pricePerSqft.textContent).toContain('\u2014');
    expect(pricePerSqft.textContent).not.toContain('$');
  });

  it('links the location to a map in a new tab', () => {
    respondWith(createListingDetail({ latitude: 38.7893, longitude: -77.1873 }));

    const link = find<HTMLAnchorElement>('.map-link')!;
    expect(link.href).toContain('mlat=38.7893&mlon=-77.1873');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(text()).toContain('38.7893');
    expect(text()).toContain('-77.1873');
  });

  it('marks active listings as success and others as warning', () => {
    respondWith(createListingDetail({ status: 'active' }));
    expect(find('.fish-badge--success')).not.toBeNull();

    paramMap.next(convertToParamMap({ id: '8' }));
    fixture.detectChanges();
    respondWith(createListingDetail({ status: 'sold' }));
    expect(find('.fish-badge--warning')).not.toBeNull();
  });

  it('says the listing could not be found on a 404', () => {
    failWith(new HttpErrorResponse({ status: 404 }));

    expect(text()).toContain("We couldn't find that listing");
    expect(find('[role="alert"]')).toBeNull();
  });

  it('does not call the API for an id that is not a number', () => {
    paramMap.next(convertToParamMap({ id: 'abc' }));
    fixture.detectChanges();

    expect(requestedIds).toEqual([7]);
    expect(text()).toContain("We couldn't find that listing");
  });

  it('shows the server message for other failures, and retries', () => {
    failWith(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong', detail: 'The database is down.' } }));

    expect(find('[role="alert"]')!.textContent).toContain('The database is down.');

    find<HTMLButtonElement>('[role="alert"] button')!.click();
    fixture.detectChanges();

    expect(requestedIds).toEqual([7, 7]);
    expect(find('fish-spinner')).not.toBeNull();
  });

  it('explains when the API cannot be reached', () => {
    failWith(new HttpErrorResponse({ status: 0 }));

    expect(find('[role="alert"]')!.textContent).toContain('Could not reach the listing service');
  });

  it('loads the new listing when the route id changes', () => {
    respondWith(createListingDetail({ id: 7 }));

    paramMap.next(convertToParamMap({ id: '9' }));
    fixture.detectChanges();

    expect(requestedIds).toEqual([7, 9]);
    expect(find('fish-spinner')).not.toBeNull();
  });

  it('goes back in history when the user arrived from within the app', () => {
    find<HTMLButtonElement>('fish-button button')!.click();

    expect(location.back).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('goes to the search page when the page was opened directly', () => {
    location.getState.and.returnValue({ navigationId: 1 });

    find<HTMLButtonElement>('fish-button button')!.click();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(location.back).not.toHaveBeenCalled();
  });
});
