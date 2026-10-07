import { ListingDetail } from '../models/listing-detail.model';

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const daysPerMonth = 30;
const daysPerYear = 365;
const monthsShownFromDays = 60;
const maxMonthsBeforeYears = 11;

export function pricePerSqft(listing: Pick<ListingDetail, 'price' | 'sqft'>): number | null {
  return listing.sqft > 0 ? Math.round(listing.price / listing.sqft) : null;
}

export function describeListingAge(listedDate: string, today: Date = new Date()): string {
  const days = daysBetween(parseDate(listedDate), startOfDay(today));

  if (days <= 0) {
    return 'today';
  }

  if (days === 1) {
    return 'yesterday';
  }

  if (days < monthsShownFromDays) {
    return `${days} days ago`;
  }

  if (days < daysPerYear) {
    return `${Math.min(maxMonthsBeforeYears, Math.floor(days / daysPerMonth))} months ago`;
  }

  const years = Math.floor(days / daysPerYear);

  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function mapUrl(listing: Pick<ListingDetail, 'latitude' | 'longitude'>): string {
  const { latitude, longitude } = listing;

  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / millisecondsPerDay);
}
