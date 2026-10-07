import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent, SelectComponent, SelectOption, TextareaComponent } from '@fish-ui/components';
import {
  FieldErrors,
  ListingFormValues,
  ListingInput,
  listingStatuses,
  toFormValues,
  toListingInput
} from './listing-form.model';
import { listingFieldRules, listingLimits, validate } from './listing-form.validators';

type TextFieldName = Exclude<keyof ListingFormValues, 'status' | 'description'>;

interface TextField {
  name: TextFieldName;
  label: string;
  type: 'text' | 'number' | 'date';
  placeholder: string;
  fullWidth?: boolean;
  maxLength?: number;
}

const textFields: TextField[] = [
  { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St', fullWidth: true, maxLength: listingLimits.addressMaxLength },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Springfield', maxLength: listingLimits.cityMaxLength },
  { name: 'state', label: 'State', type: 'text', placeholder: 'VA', maxLength: 2 },
  { name: 'zip', label: 'ZIP code', type: 'text', placeholder: '22150', maxLength: 10 },
  { name: 'price', label: 'Price', type: 'number', placeholder: '450000' },
  { name: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '3' },
  { name: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: '2.5' },
  { name: 'sqft', label: 'Square feet', type: 'number', placeholder: '1800' },
  { name: 'latitude', label: 'Latitude', type: 'number', placeholder: '38.7893' },
  { name: 'longitude', label: 'Longitude', type: 'number', placeholder: '-77.1873' },
  { name: 'listedDate', label: 'Listed date', type: 'date', placeholder: '' }
];

@Component({
  selector: 'app-listing-form',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingFormComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly listing = input<ListingInput | null>(null);
  readonly submitLabel = input('Save');
  readonly submitting = input(false);
  readonly serverErrors = input<FieldErrors>({});

  readonly save = output<ListingInput>();
  readonly cancel = output<void>();

  protected readonly textFields = textFields;
  protected readonly descriptionMaxLength = listingLimits.descriptionMaxLength;
  protected readonly statusOptions: SelectOption[] = listingStatuses.map(status => ({ value: status, label: status }));
  protected showSummary = false;

  protected readonly form = new FormGroup({
    address: this.field('address'),
    city: this.field('city'),
    state: this.field('state'),
    zip: this.field('zip'),
    price: this.field('price'),
    bedrooms: this.field('bedrooms'),
    bathrooms: this.field('bathrooms'),
    sqft: this.field('sqft'),
    latitude: this.field('latitude'),
    longitude: this.field('longitude'),
    listedDate: this.field('listedDate'),
    status: this.field('status'),
    description: this.field('description')
  });

  constructor() {
    effect(() => {
      this.form.reset(toFormValues(this.listing()));
      this.showSummary = false;
    });

    effect(() => {
      this.applyServerErrors(this.serverErrors());
      this.changeDetector.markForCheck();
    });
  }

  protected errorOf(name: keyof ListingFormValues): string | null {
    const control = this.form.controls[name];

    if (!control.touched) {
      return null;
    }

    return (control.errors?.['invalid'] ?? control.errors?.['server'] ?? null) as string | null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showSummary = true;
      return;
    }

    this.showSummary = false;
    this.save.emit(toListingInput(this.form.getRawValue()));
  }

  private applyServerErrors(errors: FieldErrors): void {
    for (const [name, messages] of Object.entries(errors)) {
      const control = this.form.controls[name as keyof ListingFormValues] as FormControl<string> | undefined;

      if (control) {
        control.setErrors({ server: messages.join(' ') });
        control.markAsTouched();
      }
    }
  }

  private field(name: keyof ListingFormValues): FormControl<string> {
    return new FormControl('', { nonNullable: true, validators: [validate(...listingFieldRules[name])] });
  }
}
