export interface ListingInput {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  status: string;
  description: string;
}

export type ListingFormValues = { [Field in keyof ListingInput]: string };

export type FieldErrors = Record<string, string[]>;

export const listingStatuses = ['active', 'pending', 'sold'] as const;

const emptyValues: ListingFormValues = {
  address: '',
  city: '',
  state: '',
  zip: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  latitude: '',
  longitude: '',
  listedDate: '',
  status: 'active',
  description: ''
};

export function toFormValues(listing: ListingInput | null): ListingFormValues {
  if (listing === null) {
    return { ...emptyValues };
  }

  return {
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    price: String(listing.price),
    bedrooms: String(listing.bedrooms),
    bathrooms: String(listing.bathrooms),
    sqft: String(listing.sqft),
    latitude: String(listing.latitude),
    longitude: String(listing.longitude),
    listedDate: listing.listedDate,
    status: listing.status,
    description: listing.description
  };
}

export function toListingInput(values: ListingFormValues): ListingInput {
  return {
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    zip: values.zip.trim(),
    price: Number(values.price),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    sqft: Number(values.sqft),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    listedDate: values.listedDate,
    status: values.status,
    description: values.description.trim()
  };
}
