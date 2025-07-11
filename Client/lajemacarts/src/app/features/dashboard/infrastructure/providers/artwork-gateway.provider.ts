import {Provider} from '@angular/core';
import {ArtworkHttpGateway} from '../gateway/artwork-http.gateway';
import {ArtworkInMemoryGateway} from '../gateway/artwork-in-memory.gateway';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';

const gatewayType: 'http' | 'in-memory' = 'http';

const httpProvider: Provider = {
  provide: ArtworkGateway,
  useClass: ArtworkHttpGateway,
};

const inMemoryProvider: Provider = {
  provide: ArtworkGateway,
  useClass: ArtworkInMemoryGateway,
};

export const artworkGatewayProvider: Provider = gatewayType === 'http' ? httpProvider : inMemoryProvider;
