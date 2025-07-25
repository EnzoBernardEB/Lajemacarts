import {Routes} from '@angular/router';
import {artworkGatewayProvider} from "./infrastructure/providers/artwork-gateway.provider";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./ui/dashboard.page').then(m => m.DashboardPage),
    providers: [artworkGatewayProvider],
  },
  {
    path: 'artworks',
    loadComponent: () => import('./ui/artworks/artworks.page').then(m => m.ArtworksPage),
    providers: [artworkGatewayProvider],
  },
  {
    path: 'artworks/new',
    loadComponent: () => import('./ui/artworks/artwork-form.page').then(m => m.ArtworkFormPage),
    data: {isEditMode: false},
    providers: [artworkGatewayProvider],
  },
  {
    path: 'artworks/:id/edit',
    loadComponent: () => import('./ui/artworks/artwork-form.page').then(m => m.ArtworkFormPage),
    data: {isEditMode: true},
    providers: [artworkGatewayProvider],
  },
  {
    path: 'materials',
    loadComponent: () => import('./ui/materials/materials.page').then(m => m.MaterialsPageComponent),
  }
];
