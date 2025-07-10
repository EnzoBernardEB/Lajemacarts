// dans /src/app/app.routes.ts

import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {NotFoundComponent} from './core/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'accueil',
    component: HomeComponent,
  },
  {
    path: 'tableau-de-bord',
    loadChildren: () => import(
      './features/dashboard/routes'
      ).then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: '',
    redirectTo: 'accueil',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
