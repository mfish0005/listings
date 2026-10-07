import { describeListingAge, mapUrl, pricePerSqft } from './listing-figures';

describe('listing figures', () => {
  describe('pricePerSqft', () => {
    it('rounds to whole dollars', () => {
      expect(pricePerSqft({ price: 450000, sqft: 980 })).toBe(459);
    });

    it('is unknown when there is no floor area', () => {
      expect(pricePerSqft({ price: 450000, sqft: 0 })).toBeNull();
    });
  });

  describe('describeListingAge', () => {
    const today = new Date(2026, 9, 5, 15, 30);

    it('says today for a listing from today', () => {
      expect(describeListingAge('2026-10-05', today)).toBe('today');
    });

    it('treats a future date as today', () => {
      expect(describeListingAge('2026-10-09', today)).toBe('today');
    });

    it('says yesterday for one day', () => {
      expect(describeListingAge('2026-10-04', today)).toBe('yesterday');
    });

    it('counts days up to two months', () => {
      expect(describeListingAge('2026-09-25', today)).toBe('10 days ago');
      expect(describeListingAge('2026-08-07', today)).toBe('59 days ago');
    });

    it('switches to months from two months, up to a year', () => {
      expect(describeListingAge('2026-08-06', today)).toBe('2 months ago');
      expect(describeListingAge('2025-10-06', today)).toBe('11 months ago');
    });

    it('switches to years after a year', () => {
      expect(describeListingAge('2025-10-05', today)).toBe('1 year ago');
      expect(describeListingAge('2023-10-05', today)).toBe('3 years ago');
    });

    it('ignores the time of day', () => {
      expect(describeListingAge('2026-10-04', new Date(2026, 9, 5, 0, 5))).toBe('yesterday');
      expect(describeListingAge('2026-10-04', new Date(2026, 9, 5, 23, 55))).toBe('yesterday');
    });
  });

  describe('mapUrl', () => {
    it('points an OpenStreetMap marker at the coordinates', () => {
      expect(mapUrl({ latitude: 38.7893, longitude: -77.1873 })).toBe(
        'https://www.openstreetmap.org/?mlat=38.7893&mlon=-77.1873#map=16/38.7893/-77.1873'
      );
    });
  });
});
