import { Routes } from '@angular/router';

export const LISTING_EDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listing-edit/listing-edit.component').then(m => m.ListingEditComponent)
  }
];
