import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Listing, PagedResult } from '../models/listing.model';
import { ListingSearchQuery } from '../models/listing-search-query.model';
import { toQueryString } from './listing-search-params';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly http = inject(HttpClient);

  search(query: ListingSearchQuery): Observable<PagedResult<Listing>> {
    const params = new HttpParams({ fromObject: toQueryString(query) });

    return this.http.get<PagedResult<Listing>>('/api/listings', { params });
  }
}
