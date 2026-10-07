import { Routes } from '@angular/router';

export const LISTING_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
  }
];
