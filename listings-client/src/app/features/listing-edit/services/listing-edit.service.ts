import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListingInput } from '../../../shared/listing-form/listing-form.model';
import { ListingRecord } from '../models/listing-record.model';

@Injectable({ providedIn: 'root' })
export class ListingEditService {
  private readonly http = inject(HttpClient);

  get(id: number): Observable<ListingRecord> {
    return this.http.get<ListingRecord>(`/api/listings/${id}`);
  }

  update(id: number, input: ListingInput): Observable<ListingRecord> {
    return this.http.put<ListingRecord>(`/api/listings/${id}`, input);
  }
}
