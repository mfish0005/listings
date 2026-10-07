import { FormControl } from '@angular/forms';
import { listingLimits, listingFieldRules, notAfter, validate } from './listing-form.validators';

function messageFor(field: keyof typeof listingFieldRules, value: string): string | null {
  const errors = validate(...listingFieldRules[field])(new FormControl(value));

  return (errors?.['invalid'] as string | undefined) ?? null;
}

describe('listing form validators', () => {
  describe('validate', () => {
    it('reports only the first failing rule', () => {
      expect(messageFor('price', '')).toBe('Price is required.');
      expect(messageFor('price', 'abc')).toBe('Price must be a number.');
    });

    it('treats a missing value as blank', () => {
      const errors = validate(...listingFieldRules.address)(new FormControl(null));

      expect(errors?.['invalid']).toBe('Address is required.');
    });
  });

  describe('text fields', () => {
    it('require a non-blank value', () => {
      expect(messageFor('address', '   ')).toBe('Address is required.');
      expect(messageFor('city', '')).toBe('City is required.');
      expect(messageFor('description', ' ')).toBe('Description is required.');
    });

    it('allow text up to the limit, ignoring surrounding spaces', () => {
      expect(messageFor('address', ` ${'a'.repeat(listingLimits.addressMaxLength)} `)).toBeNull();
      expect(messageFor('address', 'a'.repeat(listingLimits.addressMaxLength + 1))).toBe(
        'Address must be 200 characters or fewer.'
      );
      expect(messageFor('description', 'a'.repeat(listingLimits.descriptionMaxLength + 1))).toBe(
        'Description must be 2000 characters or fewer.'
      );
    });
  });

  describe('state', () => {
    it('must be two letters', () => {
      expect(messageFor('state', 'VA')).toBeNull();
      expect(messageFor('state', 'va')).toBeNull();
      expect(messageFor('state', 'V')).toBe('State must be a 2-letter code.');
      expect(messageFor('state', 'VAA')).toBe('State must be a 2-letter code.');
      expect(messageFor('state', 'V1')).toBe('State must be a 2-letter code.');
    });
  });

  describe('zip', () => {
    it('accepts five digits with an optional plus four', () => {
      expect(messageFor('zip', '22150')).toBeNull();
      expect(messageFor('zip', '22150-1234')).toBeNull();
    });

    it('rejects anything else', () => {
      for (const zip of ['2215', '221500', '22150-12', 'ABCDE']) {
        expect(messageFor('zip', zip)).toContain('ZIP code must be 5 digits');
      }
    });
  });

  describe('price', () => {
    it('must be positive and within the limit', () => {
      expect(messageFor('price', '0')).toBe('Price must be greater than 0.');
      expect(messageFor('price', '-1')).toBe('Price must be greater than 0.');
      expect(messageFor('price', '0.01')).toBeNull();
      expect(messageFor('price', '1000000000')).toBeNull();
      expect(messageFor('price', '1000000001')).toBe('Price must be 1000000000 or less.');
    });
  });

  describe('bedrooms', () => {
    it('must be a whole number from 0 to the limit', () => {
      expect(messageFor('bedrooms', '0')).toBeNull();
      expect(messageFor('bedrooms', '20')).toBeNull();
      expect(messageFor('bedrooms', '2.5')).toBe('Bedrooms must be a whole number.');
      expect(messageFor('bedrooms', '-1')).toBe('Bedrooms must be 0 or greater.');
      expect(messageFor('bedrooms', '21')).toBe('Bedrooms must be 20 or less.');
    });
  });

  describe('bathrooms', () => {
    it('must be a whole or half number from 0 to the limit', () => {
      expect(messageFor('bathrooms', '0')).toBeNull();
      expect(messageFor('bathrooms', '1.5')).toBeNull();
      expect(messageFor('bathrooms', '1.25')).toBe('Bathrooms must be a whole or half number, such as 1 or 1.5.');
      expect(messageFor('bathrooms', '-0.5')).toBe('Bathrooms must be 0 or greater.');
      expect(messageFor('bathrooms', '20.5')).toBe('Bathrooms must be 20 or less.');
    });
  });

  describe('sqft', () => {
    it('must be a positive whole number within the limit', () => {
      expect(messageFor('sqft', '0')).toBe('Square feet must be greater than 0.');
      expect(messageFor('sqft', '1.5')).toBe('Square feet must be a whole number.');
      expect(messageFor('sqft', '1000000')).toBeNull();
      expect(messageFor('sqft', '1000001')).toBe('Square feet must be 1000000 or less.');
    });
  });

  describe('coordinates', () => {
    it('keep latitude within 90 degrees', () => {
      expect(messageFor('latitude', '-90')).toBeNull();
      expect(messageFor('latitude', '90')).toBeNull();
      expect(messageFor('latitude', '90.1')).toBe('Latitude must be 90 or less.');
      expect(messageFor('latitude', '-90.1')).toBe('Latitude must be -90 or greater.');
    });

    it('keep longitude within 180 degrees', () => {
      expect(messageFor('longitude', '180')).toBeNull();
      expect(messageFor('longitude', '180.1')).toBe('Longitude must be 180 or less.');
      expect(messageFor('longitude', '-180.1')).toBe('Longitude must be -180 or greater.');
    });
  });

  describe('listed date', () => {
    it('is required', () => {
      expect(messageFor('listedDate', '')).toBe('Listed date is required.');
    });

    it('cannot be in the future', () => {
      const rule = notAfter('Listed date', () => '2026-10-05');

      expect(rule('2026-10-05')).toBeNull();
      expect(rule('2026-10-04')).toBeNull();
      expect(rule('2026-10-06')).toBe('Listed date cannot be in the future.');
    });
  });

  describe('status', () => {
    it('must be a known status', () => {
      expect(messageFor('status', 'active')).toBeNull();
      expect(messageFor('status', 'sold')).toBeNull();
      expect(messageFor('status', 'withdrawn')).toBe('Status must be one of: active, pending, sold.');
    });
  });
});
