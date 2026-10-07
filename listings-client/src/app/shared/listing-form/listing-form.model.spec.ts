import { ListingFormValues, ListingInput, toFormValues, toListingInput } from './listing-form.model';

const listing: ListingInput = {
  address: '123 Main St',
  city: 'Springfield',
  state: 'VA',
  zip: '22150',
  price: 450000,
  bedrooms: 0,
  bathrooms: 2.5,
  sqft: 1800,
  latitude: 38.7893,
  longitude: -77.1873,
  listedDate: '2026-08-29',
  status: 'pending',
  description: 'Bright condo.'
};

describe('listing form model', () => {
  describe('toFormValues', () => {
    it('turns every number into text, keeping zero', () => {
      const values = toFormValues(listing);

      expect(values.price).toBe('450000');
      expect(values.bedrooms).toBe('0');
      expect(values.bathrooms).toBe('2.5');
      expect(values.latitude).toBe('38.7893');
      expect(values.longitude).toBe('-77.1873');
    });

    it('keeps text as it is', () => {
      const values = toFormValues(listing);

      expect(values.address).toBe('123 Main St');
      expect(values.listedDate).toBe('2026-08-29');
      expect(values.status).toBe('pending');
    });

    it('starts a new listing blank but active', () => {
      const values = toFormValues(null);

      expect(values.address).toBe('');
      expect(values.price).toBe('');
      expect(values.status).toBe('active');
    });

    it('returns a fresh object each time', () => {
      expect(toFormValues(null)).not.toBe(toFormValues(null));
    });
  });

  describe('toListingInput', () => {
    it('round-trips a listing', () => {
      expect(toListingInput(toFormValues(listing))).toEqual(listing);
    });

    it('trims text and parses numbers', () => {
      const values: ListingFormValues = {
        ...toFormValues(listing),
        address: '  9 Elm Ct ',
        price: ' 300000 ',
        description: '  Nice.  '
      };

      const input = toListingInput(values);

      expect(input.address).toBe('9 Elm Ct');
      expect(input.price).toBe(300000);
      expect(input.description).toBe('Nice.');
    });
  });
});
