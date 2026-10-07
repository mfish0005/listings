import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldErrors, ListingInput } from './listing-form.model';
import { ListingFormComponent } from './listing-form.component';
import { todayAsIsoDate } from './listing-form.validators';

const listing: ListingInput = {
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
  description: 'Bright top-floor condo.'
};

describe('ListingFormComponent', () => {
  let fixture: ComponentFixture<ListingFormComponent>;
  let saved: ListingInput[];
  let cancelled: number;

  function setInput(name: 'listing' | 'submitLabel' | 'submitting' | 'serverErrors', value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function fieldInput(label: string): HTMLInputElement | HTMLTextAreaElement {
    const field = Array.from(host().querySelectorAll('label.listing-form__field')).find(
      candidate => candidate.querySelector('span')?.textContent?.trim() === label
    );

    return field!.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
  }

  function type(label: string, value: string): void {
    const input = fieldInput(label);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function blur(label: string): void {
    fieldInput(label).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function submit(): void {
    host().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function text(): string {
    return host().textContent ?? '';
  }

  beforeEach(async () => {
    saved = [];
    cancelled = 0;

    await TestBed.configureTestingModule({ imports: [ListingFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(ListingFormComponent);
    fixture.componentInstance.save.subscribe(input => saved.push(input));
    fixture.componentInstance.cancel.subscribe(() => cancelled++);
  });

  describe('with an existing listing', () => {
    beforeEach(() => setInput('listing', listing));

    it('fills every field from the listing', () => {
      expect(fieldInput('Address').value).toBe('123 Main St');
      expect(fieldInput('City').value).toBe('Springfield');
      expect(fieldInput('State').value).toBe('VA');
      expect(fieldInput('ZIP code').value).toBe('22150');
      expect(fieldInput('Price').value).toBe('450000');
      expect(fieldInput('Bedrooms').value).toBe('3');
      expect(fieldInput('Bathrooms').value).toBe('2.5');
      expect(fieldInput('Square feet').value).toBe('1800');
      expect(fieldInput('Latitude').value).toBe('38.7893');
      expect(fieldInput('Longitude').value).toBe('-77.1873');
      expect(fieldInput('Listed date').value).toBe('2026-08-29');
      expect(fieldInput('Description').value).toBe('Bright top-floor condo.');
    });

    it('shows a zero bedroom count instead of leaving it blank', () => {
      setInput('listing', { ...listing, bedrooms: 0 });

      expect(fieldInput('Bedrooms').value).toBe('0');
    });

    it('emits the listing as typed numbers when saved unchanged', () => {
      submit();

      expect(saved).toEqual([listing]);
    });

    it('emits the edited values', () => {
      type('Address', '  9 Elm Ct ');
      type('Price', '300000');
      type('Description', 'Updated.');
      submit();

      expect(saved.length).toBe(1);
      expect(saved[0]).toEqual({ ...listing, address: '9 Elm Ct', price: 300000, description: 'Updated.' });
    });

    it('shows no errors for a valid listing', () => {
      submit();

      expect(host().querySelector('.listing-form__error')).toBeNull();
      expect(host().querySelector('[role="alert"]')).toBeNull();
    });
  });

  describe('validation', () => {
    beforeEach(() => setInput('listing', listing));

    it('does not emit and explains every problem when saved with bad values', () => {
      type('Address', '');
      type('Price', '-5');
      type('State', 'Virginia');
      submit();

      expect(saved).toEqual([]);
      expect(text()).toContain('Address is required.');
      expect(text()).toContain('Price must be greater than 0.');
      expect(text()).toContain('State must be a 2-letter code.');
      expect(host().querySelector('[role="alert"]')!.textContent).toContain('Fix the highlighted fields');
    });

    it('shows a field problem once the user leaves the field', () => {
      type('Bathrooms', '1.25');
      expect(text()).not.toContain('whole or half number');

      blur('Bathrooms');

      expect(text()).toContain('Bathrooms must be a whole or half number');
    });

    it('marks an invalid field in the danger style', () => {
      type('Price', '0');
      blur('Price');

      expect(fieldInput('Price').classList).toContain('fish-input--danger');
    });

    it('rejects a listing date in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      type('Listed date', todayAsIsoDate(tomorrow));
      submit();

      expect(text()).toContain('Listed date cannot be in the future.');
      expect(saved).toEqual([]);
    });

    it('emits once the problems are fixed', () => {
      type('Address', '');
      submit();
      expect(saved).toEqual([]);

      type('Address', '1 Fixed St');
      submit();

      expect(saved.length).toBe(1);
      expect(host().querySelector('[role="alert"]')).toBeNull();
    });
  });

  describe('server errors', () => {
    const serverErrors: FieldErrors = { price: ['Price must be greater than 0.'], zip: ['ZIP code is wrong.'] };

    beforeEach(() => setInput('listing', listing));

    it('shows each message under its field', () => {
      setInput('serverErrors', serverErrors);

      expect(text()).toContain('Price must be greater than 0.');
      expect(text()).toContain('ZIP code is wrong.');
    });

    it('ignores messages for fields that are not on the form', () => {
      setInput('serverErrors', { '$.listedDate': ['The JSON value could not be converted.'] });

      expect(text()).not.toContain('could not be converted');
    });

    it('clears a message when the user edits that field', () => {
      setInput('serverErrors', serverErrors);

      type('Price', '460000');

      expect(text()).not.toContain('Price must be greater than 0.');
      expect(text()).toContain('ZIP code is wrong.');
    });
  });

  describe('buttons', () => {
    it('uses the submit label', () => {
      setInput('submitLabel', 'Save changes');

      expect(text()).toContain('Save changes');
    });

    it('shows progress and blocks cancelling while submitting', () => {
      setInput('submitting', true);

      expect(host().querySelector('button[type="submit"]')!.classList).toContain('fish-button--loading');
      expect((host().querySelectorAll('button')[0] as HTMLButtonElement).disabled).toBeTrue();
    });

    it('emits cancel without saving', () => {
      fixture.detectChanges();

      (host().querySelectorAll('button')[0] as HTMLButtonElement).click();

      expect(cancelled).toBe(1);
      expect(saved).toEqual([]);
    });
  });

  describe('without a listing', () => {
    it('starts blank with an active status', () => {
      fixture.detectChanges();

      expect(fieldInput('Address').value).toBe('');
      expect(fieldInput('Price').value).toBe('');
      expect(text()).toContain('active');
    });
  });
});
