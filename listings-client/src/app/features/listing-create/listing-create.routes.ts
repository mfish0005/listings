import { Routes } from '@angular/router';

export const LISTING_CREATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listing-create/listing-create.component').then(m => m.ListingCreateComponent)
  }
];
