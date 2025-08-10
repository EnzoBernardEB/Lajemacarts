// dans /src/app/app.routes.ts

import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {NotFoundComponent} from './core/not-found/not-found.component';
import {LayoutComponent} from './core/layout/layout.component';
import {DashboardLayoutComponent} from './features/artworks/ui/dashboard/dashboard-layout.component';
import {GalleryLayoutComponent} from './features/artworks/ui/gallery/gallery-layout.component';

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
        path: 'galerie',
        component: GalleryLayoutComponent,
        loadChildren: () => import(
          './features/artworks/routes'
          ).then(m => m.GALLERY_ROUTES)
      },
      {
        path: 'tableau-de-bord',
        component: DashboardLayoutComponent,
        loadChildren: () => import(
          './features/artworks/routes'
          ).then(m => m.DASHBOARD_ROUTES)
      },
    ]
  },

  {
    path: '**',
    component: NotFoundComponent,
  },
];
