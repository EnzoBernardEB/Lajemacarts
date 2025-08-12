import {Routes} from '@angular/router';
import {
  artworkGatewayProvider,
  artworkTypeGatewayProvider,
  materialGatewayProvider,
  mediaUploadGatewayProvider
} from "./infrastructure/providers/artwork-gateway.provider";
import {ArtworkStore} from './application/store/artwork/artwork.store';

export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'galerie',
  },
  {
    path: 'galerie',
    providers: [
      ArtworkStore,
      artworkGatewayProvider,
      materialGatewayProvider,
      artworkTypeGatewayProvider,
      mediaUploadGatewayProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./ui/gallery/gallery/gallery.page').then(m => m.GalleryPage),
      },
    ]
  },
];

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'artworks',
  },
  {
    path: 'artworks',
    providers: [
      ArtworkStore,
      artworkGatewayProvider,
      materialGatewayProvider,
      artworkTypeGatewayProvider,
      mediaUploadGatewayProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./ui/dashboard/artworks/artworks.page').then(m => m.ArtworksPage),
      },
      {
        path: 'create',
        loadComponent: () => import('./ui/dashboard/artworks/artwork-form.page').then(m => m.ArtworkFormPage),
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./ui/dashboard/artworks/artwork-form.page').then(m => m.ArtworkFormPage),
      }
    ]
  },
  {
    path: 'materials',
    loadComponent: () => import('./ui/dashboard/materials/materials.page').then(m => m.MaterialsPage),
    providers: [materialGatewayProvider],
  },
  {
    path: 'artwork-types',
    loadComponent: () => import('./ui/dashboard/artwork-types/artwork-type.page').then(m => m.ArtworkTypesPageComponent),
    providers: [artworkTypeGatewayProvider],
  }
];
