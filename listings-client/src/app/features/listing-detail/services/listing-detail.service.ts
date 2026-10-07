import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListingDetail } from '../models/listing-detail.model';

@Injectable({ providedIn: 'root' })
export class ListingDetailService {
  private readonly http = inject(HttpClient);

  get(id: number): Observable<ListingDetail> {
    return this.http.get<ListingDetail>(`/api/listings/${id}`);
  }
}
