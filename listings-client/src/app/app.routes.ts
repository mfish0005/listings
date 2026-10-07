import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'listings/:id',
    loadChildren: () =>
      import('./features/listing-detail/listing-detail.routes').then(m => m.LISTING_DETAIL_ROUTES)
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/listing-search/listing-search.routes').then(m => m.LISTING_SEARCH_ROUTES)
  }
];
