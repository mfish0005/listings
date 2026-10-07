import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ListingFormComponent } from '../../../../shared/listing-form/listing-form.component';
import { ListingInput } from '../../../../shared/listing-form/listing-form.model';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { CreatedListing } from '../../models/created-listing.model';
import { ListingCreateService } from '../../services/listing-create.service';
import { ListingCreateComponent } from './listing-create.component';

const input: ListingInput = {
  address: '9 Elm Ct',
  city: 'Springfield',
  state: 'VA',
  zip: '22150',
  price: 300000,
  bedrooms: 2,
  bathrooms: 1,
  sqft: 1200,
  latitude: 38.7,
  longitude: -77.1,
  listedDate: '2026-10-01',
  status: 'active',
  description: 'Cozy.'
};

describe('ListingCreateComponent', () => {
  let fixture: ComponentFixture<ListingCreateComponent>;
  let responses: Subject<CreatedListing>[];
  let created: ListingInput[];
  let router: jasmine.SpyObj<Router>;

  const createService = {
    create: (listing: ListingInput): Observable<CreatedListing> => {
      const response = new Subject<CreatedListing>();
      created.push(listing);
      responses.push(response);
      return response;
    }
  };

  function form(): ListingFormComponent {
    return fixture.debugElement.query(By.directive(ListingFormComponent)).componentInstance;
  }

  function finish(listing: CreatedListing): void {
    responses[responses.length - 1].next(listing);
    fixture.detectChanges();
  }

  function fail(error: HttpErrorResponse): void {
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
    created = [];
    responses = [];
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListingCreateComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ListingCreateService, useValue: createService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingCreateComponent);
    fixture.detectChanges();
  });

  it('shows an empty form that says the ID is assigned automatically', () => {
    expect(text()).toContain('Add listing');
    expect(text()).toContain('The listing ID is assigned when you save');
    expect(find<HTMLInputElement>('input')!.value).toBe('');
  });

  it('does not create anything until the form is saved', () => {
    expect(created).toEqual([]);
  });

  it('creates the listing from the form values', () => {
    form().save.emit(input);

    expect(created).toEqual([input]);
  });

  it('shows progress while saving', () => {
    form().save.emit(input);
    fixture.detectChanges();

    expect(form().submitting()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('opens the new listing in place of the add page in history', () => {
    form().save.emit(input);
    finish({ id: 301 });

    expect(router.navigate).toHaveBeenCalledOnceWith(['/listings', 301], { replaceUrl: true });
  });

  it('shows the message and passes field errors to the form when the server rejects the listing', () => {
    form().save.emit(input);
    fail(
      new HttpErrorResponse({
        status: 400,
        error: {
          title: 'Invalid listing',
          detail: 'Price must be greater than 0.',
          errors: { price: ['Price must be greater than 0.'] }
        }
      })
    );

    expect(find('.create__alert')!.textContent).toContain('Price must be greater than 0.');
    expect(form().serverErrors()).toEqual({ price: ['Price must be greater than 0.'] });
    expect(form().submitting()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps the form when the API cannot be reached', () => {
    form().save.emit(input);
    fail(new HttpErrorResponse({ status: 0 }));

    expect(find('.create__alert')!.textContent).toContain('Could not reach the listing service');
    expect(find('app-listing-form')).not.toBeNull();
  });

  it('uses a generic message for failures without details', () => {
    form().save.emit(input);
    fail(new HttpErrorResponse({ status: 502, error: null }));

    expect(find('.create__alert')!.textContent).toContain('Something went wrong while adding this listing');
  });

  it('can be saved again after a failure', () => {
    form().save.emit(input);
    fail(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } }));

    form().save.emit(input);
    fixture.detectChanges();

    expect(created.length).toBe(2);
    expect(find('.create__alert')).toBeNull();
  });

  it('returns to the last search when cancelled', () => {
    TestBed.inject(LastSearch).remember({ city: 'Vienna', page: '2' });

    form().cancel.emit();

    expect(router.navigate).toHaveBeenCalledWith(['/'], { queryParams: { city: 'Vienna', page: '2' } });
    expect(created).toEqual([]);
  });
});
