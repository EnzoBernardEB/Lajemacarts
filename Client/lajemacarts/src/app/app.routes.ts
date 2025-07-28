// dans /src/app/app.routes.ts

import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {NotFoundComponent} from './core/not-found/not-found.component';
import {LayoutComponent} from './core/layout/layout.component';
import {DashboardLayoutComponent} from './features/dashboard/ui/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'accueil',
        component: HomeComponent,
      },
      {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full',
      },
      {
        path: 'tableau-de-bord',
        component: DashboardLayoutComponent,
        loadChildren: () => import(
          './features/dashboard/routes'
          ).then(m => m.DASHBOARD_ROUTES)
      },
    ]
  },

  {
    path: '**',
    component: NotFoundComponent,
  },
];
