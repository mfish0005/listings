import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ListingFormComponent } from '../../../../shared/listing-form/listing-form.component';
import { ListingInput } from '../../../../shared/listing-form/listing-form.model';
import { LastSearch } from '../../../../shared/navigation/last-search';
import { ListingRecord } from '../../models/listing-record.model';
import { ListingEditService } from '../../services/listing-edit.service';
import { createListingRecord } from '../../testing/listing-record-factory';
import { ListingEditComponent } from './listing-edit.component';

describe('ListingEditComponent', () => {
  let fixture: ComponentFixture<ListingEditComponent>;
  let paramMap: BehaviorSubject<ParamMap>;
  let loads: Subject<ListingRecord>[];
  let saves: Subject<ListingRecord>[];
  let requestedIds: number[];
  let updates: { id: number; input: ListingInput }[];
  let router: jasmine.SpyObj<Router>;

  const editService = {
    get: (id: number): Observable<ListingRecord> => {
      const response = new Subject<ListingRecord>();
      requestedIds.push(id);
      loads.push(response);
      return response;
    },
    update: (id: number, input: ListingInput): Observable<ListingRecord> => {
      const response = new Subject<ListingRecord>();
      updates.push({ id, input });
      saves.push(response);
      return response;
    }
  };

  function load(listing: ListingRecord): void {
    loads[loads.length - 1].next(listing);
    fixture.detectChanges();
  }

  function failLoad(error: HttpErrorResponse): void {
    loads[loads.length - 1].error(error);
    fixture.detectChanges();
  }

  function finishSave(listing: ListingRecord): void {
    saves[saves.length - 1].next(listing);
    fixture.detectChanges();
  }

  function failSave(error: HttpErrorResponse): void {
    saves[saves.length - 1].error(error);
    fixture.detectChanges();
  }

  function form(): ListingFormComponent {
    return fixture.debugElement.query(By.directive(ListingFormComponent)).componentInstance;
  }

  function inputFrom(listing: ListingRecord): ListingInput {
    const { id, source, externalId, ...input } = listing;
    return input;
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function find<T extends Element>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }

  beforeEach(async () => {
    requestedIds = [];
    updates = [];
    loads = [];
    saves = [];
    paramMap = new BehaviorSubject(convertToParamMap({ id: '7' }));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ListingEditComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
        { provide: Router, useValue: router },
        { provide: ListingEditService, useValue: editService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingEditComponent);
    fixture.detectChanges();
  });

  describe('loading', () => {
    it('requests the listing named in the route', () => {
      expect(requestedIds).toEqual([7]);
    });

    it('shows a spinner and no form until the listing arrives', () => {
      expect(find('fish-spinner')).not.toBeNull();
      expect(find('app-listing-form')).toBeNull();
    });

    it('shows the form filled with the listing', () => {
      load(createListingRecord({ address: '9 Elm Ct', source: 'MLS_B', externalId: 'B9' }));

      expect(text()).toContain('Edit listing');
      expect(text()).toContain('MLS_B');
      expect(text()).toContain('B9');
      expect(find<HTMLInputElement>('input')!.value).toBe('9 Elm Ct');
      expect(find('fish-spinner')).toBeNull();
    });

    it('says the listing could not be found on a 404', () => {
      failLoad(new HttpErrorResponse({ status: 404 }));

      expect(text()).toContain("We couldn't find that listing");
      expect(find('app-listing-form')).toBeNull();
      expect(find('[role="alert"]')).toBeNull();
    });

    it('does not call the API for an id that is not a number', () => {
      paramMap.next(convertToParamMap({ id: 'abc' }));
      fixture.detectChanges();

      expect(requestedIds).toEqual([7]);
      expect(text()).toContain("We couldn't find that listing");
    });

    it('shows the server message for other failures, and retries', () => {
      failLoad(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong', detail: 'The database is down.' } }));

      expect(find('[role="alert"]')!.textContent).toContain('The database is down.');

      find<HTMLButtonElement>('[role="alert"] fish-button:last-child button')!.click();
      fixture.detectChanges();

      expect(requestedIds).toEqual([7, 7]);
      expect(find('fish-spinner')).not.toBeNull();
    });

    it('loads the new listing when the route id changes', () => {
      load(createListingRecord({ id: 7 }));

      paramMap.next(convertToParamMap({ id: '9' }));
      fixture.detectChanges();

      expect(requestedIds).toEqual([7, 9]);
      expect(find('fish-spinner')).not.toBeNull();
    });
  });

  describe('saving', () => {
    const listing = createListingRecord({ id: 7 });
    const edited: ListingInput = { ...inputFrom(listing), address: '9 Elm Ct', price: 300000 };

    beforeEach(() => load(listing));

    it('puts the edited listing to its id', () => {
      form().save.emit(edited);

      expect(updates).toEqual([{ id: 7, input: edited }]);
    });

    it('shows progress while the save is running', () => {
      form().save.emit(edited);
      fixture.detectChanges();

      expect(form().submitting()).toBeTrue();
    });

    it('opens the saved listing in place of the edit page in history', () => {
      form().save.emit(edited);
      finishSave({ ...listing, ...edited });

      expect(router.navigate).toHaveBeenCalledOnceWith(['/listings', 7], { replaceUrl: true });
    });

    it('stays on the form until the save succeeds', () => {
      form().save.emit(edited);

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('shows the message and passes field errors to the form when the server rejects the listing', () => {
      form().save.emit(edited);
      failSave(
        new HttpErrorResponse({
          status: 400,
          error: {
            title: 'Invalid listing',
            detail: 'Price must be greater than 0.',
            errors: { price: ['Price must be greater than 0.'] }
          }
        })
      );

      expect(find('.edit__alert')!.textContent).toContain('Price must be greater than 0.');
      expect(form().serverErrors()).toEqual({ price: ['Price must be greater than 0.'] });
      expect(form().submitting()).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('keeps the form and the edits when the save fails for another reason', () => {
      form().save.emit(edited);
      failSave(new HttpErrorResponse({ status: 0 }));

      expect(find('.edit__alert')!.textContent).toContain('Could not reach the listing service');
      expect(find('app-listing-form')).not.toBeNull();
      expect(form().serverErrors()).toEqual({});
    });

    it('can be saved again after a failure', () => {
      form().save.emit(edited);
      failSave(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } }));

      form().save.emit(edited);
      fixture.detectChanges();

      expect(updates.length).toBe(2);
      expect(find('.edit__alert')).toBeNull();
    });

    it('says the listing is gone when it was deleted before the save', () => {
      form().save.emit(edited);
      failSave(new HttpErrorResponse({ status: 404 }));

      expect(text()).toContain("We couldn't find that listing");
      expect(find('app-listing-form')).toBeNull();
    });
  });

  describe('leaving', () => {
    it('returns to the listing when cancelled', () => {
      load(createListingRecord({ id: 7 }));

      form().cancel.emit();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/listings', 7], { replaceUrl: true });
    });

    it('returns to the last search from the not-found panel', () => {
      TestBed.inject(LastSearch).remember({ city: 'Vienna' });
      failLoad(new HttpErrorResponse({ status: 404 }));

      find<HTMLButtonElement>('fish-button button')!.click();

      expect(router.navigate).toHaveBeenCalledWith(['/'], { queryParams: { city: 'Vienna' } });
    });

    it('returns to the last search from the load error panel', () => {
      TestBed.inject(LastSearch).remember({ keyword: 'metro' });
      failLoad(new HttpErrorResponse({ status: 500 }));

      find<HTMLButtonElement>('[role="alert"] fish-button:first-child button')!.click();

      expect(router.navigate).toHaveBeenCalledWith(['/'], { queryParams: { keyword: 'metro' } });
    });
  });
});
