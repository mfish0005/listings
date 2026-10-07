import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Params, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { Listing, PagedResult } from '../../models/listing.model';
import { ListingSearchQuery } from '../../models/listing-search-query.model';
import { ListingService } from '../../services/listing.service';
import { createListing, createPage } from '../../testing/listing-factory';
import { ListingSearchComponent } from './listing-search.component';

describe('ListingSearchComponent', () => {
  let fixture: ComponentFixture<ListingSearchComponent>;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let searchResponses: Subject<PagedResult<Listing>>[];
  let searchCalls: ListingSearchQuery[];
  let navigate: jasmine.Spy;

  const listingService = {
    search: (query: ListingSearchQuery): Observable<PagedResult<Listing>> => {
      const response = new Subject<PagedResult<Listing>>();
      searchCalls.push(query);
      searchResponses.push(response);
      return response;
    }
  };

  function setQueryParams(params: Params): void {
    queryParams.next(convertToParamMap(params));
    fixture.detectChanges();
  }

  function respondWith(page: PagedResult<Listing>): void {
    searchResponses[searchResponses.length - 1].next(page);
    fixture.detectChanges();
  }

  function failWith(error: HttpErrorResponse): void {
    searchResponses[searchResponses.length - 1].error(error);
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function find<T extends Element>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }

  beforeEach(async () => {
    searchCalls = [];
    searchResponses = [];
    queryParams = new BehaviorSubject(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [ListingSearchComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } },
        { provide: ListingService, useValue: listingService }
      ]
    }).compileComponents();

    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ListingSearchComponent);
    fixture.detectChanges();
  });

  it('searches with the filters from the URL', () => {
    setQueryParams({ city: 'Vienna', targetBudget: '450000', page: '2' });

    expect(searchCalls[searchCalls.length - 1]).toEqual(
      jasmine.objectContaining({ city: 'Vienna', targetBudget: '450000', page: 2 })
    );
  });

  it('remembers the search so other pages can return to it', () => {
    setQueryParams({ city: 'Vienna', keyword: ' metro ', page: '3' });

    expect(TestBed.inject(LastSearch).queryParams).toEqual({ city: 'Vienna', keyword: 'metro', page: '3' });
  });

  it('forgets filters once the search is cleared', () => {
    setQueryParams({ city: 'Vienna' });
    setQueryParams({});

    expect(TestBed.inject(LastSearch).queryParams).toEqual({});
  });

  it('shows a spinner while loading', () => {
    expect(find('fish-spinner')).not.toBeNull();
    expect(find('app-listing-card')).toBeNull();
  });

  it('shows a card per listing with a result summary', () => {
    respondWith(createPage({
      results: [createListing({ id: 1 }), createListing({ id: 2, address: '55 Elm Ct' })],
      totalCount: 12,
      totalPages: 3
    }));

    expect(fixture.nativeElement.querySelectorAll('app-listing-card').length).toBe(2);
    expect(text()).toContain('Showing 1–2 of 12 listings');
    expect(find('fish-spinner')).toBeNull();
  });

  it('numbers the summary from the current page', () => {
    respondWith(createPage({
      results: [createListing({ id: 11 }), createListing({ id: 12 })],
      page: 3,
      totalCount: 12,
      totalPages: 3
    }));

    expect(text()).toContain('Showing 11–12 of 12 listings');
  });

  it('shows the no-results state when nothing matches', () => {
    respondWith(createPage({ results: [], totalCount: 0, totalPages: 0 }));

    expect(text()).toContain('No listings match your search');
    expect(find('fish-pagination nav')).toBeNull();
  });

  it('keeps the pager available when the requested page is past the end', () => {
    respondWith(createPage({ results: [], page: 9, totalCount: 12, totalPages: 3 }));

    expect(text()).toContain('There are no listings on page 9');
    expect(find('fish-pagination nav')).not.toBeNull();
  });

  it('shows the server detail when the request is rejected', () => {
    failWith(new HttpErrorResponse({
      status: 400,
      error: { title: 'Invalid search request', detail: 'minPrice cannot be greater than maxPrice.' }
    }));

    expect(find('[role="alert"]')?.textContent).toContain('minPrice cannot be greater than maxPrice.');
  });

  it('retries the same search from the error state', () => {
    failWith(new HttpErrorResponse({ status: 500 }));
    const callsBeforeRetry = searchCalls.length;

    find<HTMLButtonElement>('[role="alert"] button')!.click();

    expect(searchCalls.length).toBe(callsBeforeRetry + 1);
  });

  it('navigates to the chosen page and keeps the filters', () => {
    setQueryParams({ city: 'Vienna' });
    respondWith(createPage({ totalCount: 12, totalPages: 3 }));

    find<HTMLButtonElement>('button[aria-label="Page 2"]')!.click();

    expect(navigate).toHaveBeenCalledWith([], { queryParams: { city: 'Vienna', page: '2' } });
  });

  it('ignores a stale response when a newer search starts', () => {
    setQueryParams({ city: 'Vienna' });
    const staleResponse = searchResponses[searchResponses.length - 1];
    setQueryParams({ city: 'Fairfax' });

    staleResponse.next(createPage({ results: [createListing({ address: 'Stale St' })] }));
    fixture.detectChanges();

    expect(text()).not.toContain('Stale St');
    expect(find('fish-spinner')).not.toBeNull();
  });
});
