import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {ArtworkTypeStore} from './artwork-type.store';
import {mockArtworkTypes} from '../artwork/artwork.store.data';
import {ArtworkTypeInMemoryGateway} from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {of} from 'rxjs';
import {ArtworkType} from '../../../domain/models/artwork-type';

function initStore(partial?: StateSignals<typeof ArtworkTypeStore>) {
  const store = TestBed.inject(ArtworkTypeStore);
  patchState(unprotected(store), partial ?? {});
  return store
}

describe('ArtworkTpesStore', () => {
  let artworkTypeInMemoryGateway: ArtworkTypeInMemoryGateway;

  beforeEach(() => {

    artworkTypeInMemoryGateway = new ArtworkTypeInMemoryGateway()
    TestBed.configureTestingModule({
      providers: [
        ArtworkTypeStore,
        {provide: ArtworkTypeGateway, useValue: artworkTypeInMemoryGateway},
      ]
    });
  })

  it('should_initialize_withDefaultEmptyState', () => {
    const store = initStore();
    expect(store.artworkTypes()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
  });

  it('should_reflectArtworksPresence_in_isEmptySignal', () => {
    const store = initStore()
    expect(store.isEmpty()).toBe(true);
    patchState(unprotected(store), {artworkTypes: mockArtworkTypes})
    expect(store.isEmpty()).toBe(false);
  })

  it('should_countAllArtworks_when_noFilterIsActive', () => {
    const store = initStore({artworkTypes: mockArtworkTypes})
    expect(store.filteredCount()).toBe(5);
  })

  describe('Filtering Logic', () => {
    it('should filter materials by a matching search term', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('Résine');

      expect(store.filteredCount()).toBe(1);
      expect(store.filteredArtworkTypes()[0].name.value).toBe('Résine Époxy');
    });

    it('should be case-insensitive', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('résine');

      expect(store.filteredCount()).toBe(1);
    });

    it('should trim whitespace from the search term', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('  Résine  '); // avec des espaces

      expect(store.filteredCount()).toBe(1);
    });

    it('should return all materials if the search term is empty', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('');

      expect(store.filteredCount()).toBe(mockArtworkTypes.length);
    });

    it('should return an empty array if no material matches', () => {
      const store = initStore({artworkTypes: mockArtworkTypes});

      store.updateSearchTerm('unmaterialquinexistepas');

      expect(store.filteredCount()).toBe(0);
      expect(store.filteredArtworkTypes()).toEqual([]);
    });
  });

  describe('Update Logic', () => {
    it('should optimistically update an artwork type and set status to success on gateway success', fakeAsync(() => {
      const initialTypes = JSON.parse(JSON.stringify(mockArtworkTypes));
      const store = initStore({artworkTypes: initialTypes});

      const typeToUpdate = initialTypes[0];

      const updatePayload = {
        id: typeToUpdate.id,
        name: 'Peinture à l\'Huile',
        basePrice: 25,
        profitMultiplier: 2.2
      };

      const gatewaySpy = jest.spyOn(artworkTypeInMemoryGateway, 'update').mockReturnValue(of(undefined as any));

      store.update(updatePayload);

      expect(store.requestStatus()).toBe('pending');

      const updatedType = store.artworkTypes().find(at => at.id === typeToUpdate.id);
      expect(updatedType?.name.value).toBe('Peinture à l\'Huile');

      tick();

      expect(store.requestStatus()).toBe('fulfilled');
      expect(gatewaySpy).toHaveBeenCalledWith(expect.any(ArtworkType));
      expect(gatewaySpy).toHaveBeenCalledTimes(1);
    }));

    // Scénario 2: L'échec du réseau
    it('should revert the optimistic update and set status to error when gateway fails', (done) => {
      const originalName = mockArtworkTypes.find(at => at.id === '1')!.name.value;
      const store = initStore({artworkTypes: [...mockArtworkTypes]});
      const updatePayload = {id: '1', name: 'Nom Qui Va Échouer', basePrice: 99, profitMultiplier: 9};
      const errorMessage = 'Network Error';

      jest.spyOn(gateway, 'update').mockReturnValue(throwError(() => new Error(errorMessage)));

      // Action
      store.update(updatePayload);

      // Vérification de la mise à jour optimiste
      expect(store.artworkTypes().find(at => at.id === '1')?.name.value).toBe('Nom Qui Va Échouer');

      setTimeout(() => {
        expect(store.requestStatus()).toEqual({error: errorMessage});
        // Assertion cruciale : vérification du rollback
        expect(store.artworkTypes().find(at => at.id === '1')?.name.value).toBe(originalName);
        done();
      }, 0);
    });

    // Scénario 3: L'échec de la validation du domaine
    it('should set status to error and not call the gateway if domain validation fails', (done) => {
      const store = initStore({artworkTypes: [...mockArtworkTypes]});
      const artworkTypeToUpdate = store.artworkTypes().find(at => at.id === '1')!;
      const invalidPayload = {id: '1', name: '', basePrice: -10, profitMultiplier: 0.5}; // Nom vide, invalide
      const validationError = new DomainError('NAME_EMPTY', 'Le nom ne peut pas être vide.');

      // On simule l'échec de la méthode `update` du modèle
      jest.spyOn(artworkTypeToUpdate, 'update').mockReturnValue(Result.failure(validationError));
      const gatewaySpy = jest.spyOn(gateway, 'update');

      // Action
      store.update(invalidPayload);

      setTimeout(() => {
        expect(store.requestStatus()).toEqual({error: validationError.message});
        // Le gateway ne doit jamais avoir été appelé
        expect(gatewaySpy).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    // Scénario 4: L'ID inexistant
    it('should set status to error and not call the gateway if ID does not exist', (done) => {
      const store = initStore({artworkTypes: [...mockArtworkTypes]});
      const updatePayload = {id: '999', name: 'Inexistant', basePrice: 1, profitMultiplier: 1};

      const gatewaySpy = jest.spyOn(gateway, 'update');

      // Action
      store.update(updatePayload);

      setTimeout(() => {
        expect(store.requestStatus()).toEqual({error: 'Type d\'œuvre non trouvé.'});
        expect(gatewaySpy).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
