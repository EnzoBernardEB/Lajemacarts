import {Routes} from '@angular/router';
import {
  artworkGatewayProvider,
  artworkTypeGatewayProvider,
  materialGatewayProvider
} from "./infrastructure/providers/artwork-gateway.provider";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'artworks',
  },
  {
    path: 'artworks',
    loadComponent: () => import('./ui/pages/artworks.page').then(m => m.ArtworksPage),
    providers: [artworkGatewayProvider, materialGatewayProvider, artworkTypeGatewayProvider],
  },
  // {
  //   path: 'artworks/new',
  //   loadComponent: () => import('./ui/artwork-form.page').then(m => m.ArtworkFormPage),
  //   data: {isEditMode: false},
  //   providers: [artworkGatewayProvider],
  // },
  // {
  //   path: 'artworks/:id/edit',
  //   loadComponent: () => import('./ui/artwork-form.page').then(m => m.ArtworkFormPage),
  //   data: {isEditMode: true},
  //   providers: [artworkGatewayProvider],
  // },
  // {
  //   path: 'materials',
  //   loadComponent: () => import('./ui/materials/materials.page').then(m => m.MaterialsPageComponent),
  // }
];
