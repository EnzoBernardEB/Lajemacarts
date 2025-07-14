import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ArtworkStore} from './artwork.store';
import {delay, of} from 'rxjs';
import {provideHttpClient} from '@angular/common/http';
import {mockArtworks, singleMockArtwork} from './artwork.store.data';
import {ArtworkGateway} from '../../domain/ ports/artwork.gateway';

describe('ArtworkStore', () => {
  let artworkGatewaySpy: jest.Mocked<ArtworkGateway>;

  beforeEach(() => {
    artworkGatewaySpy = {
      getAll: jest.fn(),
      add: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ArtworkStore,
        {provide: ArtworkGateway, useValue: artworkGatewaySpy},
      ],
    });

  });

  it('should be created', () => {
    const store = TestBed.inject(ArtworkStore);

    expect(store).toBeTruthy();
  });

  describe('loadArtworks', () => {
    it('should set request status to pending, then fulfilled, and update the state on success', fakeAsync(() => {
      const store = TestBed.inject(ArtworkStore);
      const mockDelay = 500;
      artworkGatewaySpy.getAll.mockReturnValue(of(mockArtworks).pipe(delay(mockDelay)));

      store.loadArtworks();

      expect(store.isPending()).toBe(true);
      expect(store.isFulfilled()).toBe(false);

      tick();

      tick(mockDelay);

      expect(store.isFulfilled()).toBe(true);
      expect(store.isPending()).toBe(false);

      expect(store.artworks()).toEqual(mockArtworks);
    }));

    it('should update artworks state with data from the gateway on success', () => {
      const store = TestBed.inject(ArtworkStore);

      artworkGatewaySpy.getAll.mockReturnValue(of(mockArtworks));

      store.loadArtworks();

      expect(store.artworks()).toEqual(mockArtworks);
      expect(store.artworks().length).toBe(3);
      expect(store.artworks()[0].name.value).toBe('Vase en Terre Cuite');
    });
  });

  describe('addArtwork', () => {
    it('should add an artwork to the state optimistically', () => {
      const store = TestBed.inject(ArtworkStore);

      const newArtwork = singleMockArtwork;
      artworkGatewaySpy.add.mockReturnValue(of(newArtwork));

      store.addArtwork(newArtwork);

      expect(store.artworks()).toContain(newArtwork);
    });
  });
});
