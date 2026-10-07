import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'listings/:id/edit',
    loadChildren: () =>
      import('./features/listing-edit/listing-edit.routes').then(m => m.LISTING_EDIT_ROUTES)
  },
  {
    path: 'listings/:id',
    loadChildren: () =>
      import('./features/listing-view/listing-view.routes').then(m => m.LISTING_VIEW_ROUTES)
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/listing-search/listing-search.routes').then(m => m.LISTING_SEARCH_ROUTES)
  }
];
