import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { listingStatuses } from './listing-form.model';

export type Rule = (value: string) => string | null;

export const listingLimits = {
  addressMaxLength: 200,
  cityMaxLength: 100,
  descriptionMaxLength: 2000,
  maxPrice: 1_000_000_000,
  maxBedrooms: 20,
  maxBathrooms: 20,
  maxSqft: 1_000_000
} as const;

const statePattern = /^[A-Za-z]{2}$/;
const zipPattern = /^\d{5}(-\d{4})?$/;

export function validate(...rules: Rule[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    for (const rule of rules) {
      const message = rule(value);

      if (message !== null) {
        return { invalid: message };
      }
    }

    return null;
  };
}

export const required = (label: string): Rule => value =>
  value.trim() === '' ? `${label} is required.` : null;

export const maxLength = (label: string, max: number): Rule => value =>
  value.trim().length > max ? `${label} must be ${max} characters or fewer.` : null;

export const matches = (pattern: RegExp, message: string): Rule => value =>
  pattern.test(value.trim()) ? null : message;

export const isNumber = (label: string): Rule => value =>
  Number.isFinite(Number(value)) ? null : `${label} must be a number.`;

export const isWholeNumber = (label: string): Rule => value =>
  Number.isInteger(Number(value)) ? null : `${label} must be a whole number.`;

export const greaterThan = (label: string, bound: number): Rule => value =>
  Number(value) > bound ? null : `${label} must be greater than ${bound}.`;

export const atLeast = (label: string, bound: number): Rule => value =>
  Number(value) >= bound ? null : `${label} must be ${bound} or greater.`;

export const atMost = (label: string, bound: number): Rule => value =>
  Number(value) <= bound ? null : `${label} must be ${bound} or less.`;

export const inHalfSteps = (label: string): Rule => value =>
  Number(value) % 0.5 === 0 ? null : `${label} must be a whole or half number, such as 1 or 1.5.`;

export const notAfter = (label: string, latest: () => string): Rule => value =>
  value <= latest() ? null : `${label} cannot be in the future.`;

export const oneOf = (label: string, allowed: readonly string[]): Rule => value =>
  allowed.includes(value) ? null : `${label} must be one of: ${allowed.join(', ')}.`;

export function todayAsIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
}

export const listingFieldRules = {
  address: [required('Address'), maxLength('Address', listingLimits.addressMaxLength)],
  city: [required('City'), maxLength('City', listingLimits.cityMaxLength)],
  state: [required('State'), matches(statePattern, 'State must be a 2-letter code.')],
  zip: [required('ZIP code'), matches(zipPattern, 'ZIP code must be 5 digits, optionally followed by a dash and 4 digits.')],
  price: [required('Price'), isNumber('Price'), greaterThan('Price', 0), atMost('Price', listingLimits.maxPrice)],
  bedrooms: [
    required('Bedrooms'),
    isNumber('Bedrooms'),
    isWholeNumber('Bedrooms'),
    atLeast('Bedrooms', 0),
    atMost('Bedrooms', listingLimits.maxBedrooms)
  ],
  bathrooms: [
    required('Bathrooms'),
    isNumber('Bathrooms'),
    atLeast('Bathrooms', 0),
    atMost('Bathrooms', listingLimits.maxBathrooms),
    inHalfSteps('Bathrooms')
  ],
  sqft: [
    required('Square feet'),
    isNumber('Square feet'),
    isWholeNumber('Square feet'),
    greaterThan('Square feet', 0),
    atMost('Square feet', listingLimits.maxSqft)
  ],
  latitude: [required('Latitude'), isNumber('Latitude'), atLeast('Latitude', -90), atMost('Latitude', 90)],
  longitude: [required('Longitude'), isNumber('Longitude'), atLeast('Longitude', -180), atMost('Longitude', 180)],
  listedDate: [required('Listed date'), notAfter('Listed date', todayAsIsoDate)],
  status: [required('Status'), oneOf('Status', listingStatuses)],
  description: [required('Description'), maxLength('Description', listingLimits.descriptionMaxLength)]
} as const satisfies Record<string, readonly Rule[]>;
