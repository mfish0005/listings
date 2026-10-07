import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListingInput } from '../../../shared/listing-form/listing-form.model';
import { CreatedListing } from '../models/created-listing.model';

@Injectable({ providedIn: 'root' })
export class ListingCreateService {
  private readonly http = inject(HttpClient);

  create(input: ListingInput): Observable<CreatedListing> {
    return this.http.post<CreatedListing>('/api/listings', input);
  }
}
