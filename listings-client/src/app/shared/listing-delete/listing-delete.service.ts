import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListingDeleteService {
  private readonly http = inject(HttpClient);

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/listings/${id}`);
  }
}
