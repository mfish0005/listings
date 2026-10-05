import { Routes } from '@angular/router';

export const LISTING_SEARCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listing-search/listing-search.component').then(m => m.ListingSearchComponent)
  }
];
