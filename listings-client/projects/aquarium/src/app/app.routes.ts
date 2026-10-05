import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'components',
    children: [
      {
        path: '',
        redirectTo: 'button',
        pathMatch: 'full'
      },
      {
        path: 'button',
        loadComponent: () => import('./features/button-demo/button-demo.component').then(m => m.ButtonDemoComponent)
      },
      {
        path: 'card',
        loadComponent: () => import('./features/card-demo/card-demo.component').then(m => m.CardDemoComponent)
      },
      {
        path: 'badge',
        loadComponent: () => import('./features/badge-demo/badge-demo.component').then(m => m.BadgeDemoComponent)
      },
      {
        path: 'spinner',
        loadComponent: () => import('./features/spinner-demo/spinner-demo.component').then(m => m.SpinnerDemoComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search-demo/search-demo.component').then(m => m.SearchDemoComponent)
      },
      {
        path: 'icon',
        loadComponent: () => import('./features/icon-demo/icon-demo.component').then(m => m.IconDemoComponent)
      },
      {
        path: 'input',
        loadComponent: () => import('./features/input-demo/input-demo.component').then(m => m.InputDemoComponent)
      },
      {
        path: 'textarea',
        loadComponent: () => import('./features/textarea-demo/textarea-demo.component').then(m => m.TextareaDemoComponent)
      },
      {
        path: 'select',
        loadComponent: () => import('./features/select-demo/select-demo.component').then(m => m.SelectDemoComponent)
      },
    ]
  },
  {
    path: 'docs',
    children: [
      {
        path: '',
        redirectTo: 'getting-started',
        pathMatch: 'full'
      },
      {
        path: 'getting-started',
        loadComponent: () => import('./features/docs/getting-started/getting-started.component').then(m => m.GettingStartedComponent)
      },
      {
        path: 'theming',
        loadComponent: () => import('./features/docs/theming/theming.component').then(m => m.ThemingComponent)
      },
      {
        path: 'variables',
        loadComponent: () => import('./features/docs/variables/variables.component').then(m => m.VariablesComponent)
      },
      {
        path: 'helpers',
        loadComponent: () => import('./features/docs/helpers/helpers.component').then(m => m.HelpersComponent)
      },
    ]
  },
];
