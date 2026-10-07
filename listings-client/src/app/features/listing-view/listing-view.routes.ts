import { Routes } from '@angular/router';

export const LISTING_VIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listing-view/listing-view.component').then(m => m.ListingViewComponent)
  }
];
