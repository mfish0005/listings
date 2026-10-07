import { ListingInput } from '../../../shared/listing-form/listing-form.model';

export interface ListingRecord extends ListingInput {
  id: number;
  source: string;
  externalId: string;
}
