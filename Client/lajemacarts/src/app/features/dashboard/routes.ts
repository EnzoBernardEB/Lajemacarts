import {Routes} from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import(
      './ui/dashboard.page'
      ).then(m => m.DashboardPage),
  },
  {
    path: 'artworks',
    loadComponent: () => import(
      './ui/artworks/artworks.page'
      ).then(m => m.ArtworksPage),
  },
  {
    path: 'artworks/new',
    loadComponent: () => import(
      './ui/artworks/artwork-form.page'
      ).then(m => m.ArtworkFormPage),
    data: {isEditMode: false}
  },
  {
    path: 'artworks/:id/edit',
    loadComponent: () => import(
      './ui/artworks/artwork-form.page'
      ).then(m => m.ArtworkFormPage),
    data: {isEditMode: true}
  }
];
