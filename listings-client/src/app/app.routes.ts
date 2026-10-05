import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/listing-search/listing-search.routes').then(m => m.LISTING_SEARCH_ROUTES)
  }
];
