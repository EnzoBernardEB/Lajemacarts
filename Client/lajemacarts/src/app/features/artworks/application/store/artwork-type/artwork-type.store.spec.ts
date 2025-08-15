import {TestBed} from '@angular/core/testing';
import {patchState, StateSignals} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {of, throwError} from 'rxjs';

import {ArtworkTypeStore} from './artwork-type.store';
import {ArtworkTypeGateway} from '../../../domain/ ports/artwork-type.gateway';
import {ArtworkTypeInMemoryGateway} from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import {ArtworkType} from '../../../domain/models/artwork-type';
import {Name} from '../../../domain/models/value-objects/name';
import {Money} from '../../../domain/models/value-objects/money.model';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

const getFreshMockTypes = (): ArtworkType[] => [
  ArtworkType.hydrate({
    id: '1',
    name: Name.hydrate('Peinture Acrylique'),
    basePrice: Money.hydrate(20),
    profitMultiplier: 2.5,
  }),
  ArtworkType.hydrate({
    id: '2',
    name: Name.hydrate('Sculpture sur Bois'),
    basePrice: Money.hydrate(150),
    profitMultiplier: 1.8,
  }),
  ArtworkType.hydrate({
    id: '3',
    name: Name.hydrate('Aquarelle'),
    basePrice: Money.hydrate(35),
    profitMultiplier: 3.0,
  }),
];

describe('ArtworkTypeStore', () => {
  let artworkTypeGateway: ArtworkTypeGateway;
  let store: ReturnType<typeof initStore>;

  function initStore(
    initialState: Partial<StateSignals<typeof ArtworkTypeStore>> = {}
  ) {
    const storeInstance = TestBed.inject(ArtworkTypeStore);
    patchState(unprotected(storeInstance), initialState);
    return storeInstance;
  }

  beforeEach(() => {
    const gatewayMock = new ArtworkTypeInMemoryGateway();
    gatewayMock.feedWith(getFreshMockTypes());

    TestBed.configureTestingModule({
      providers: [
        ArtworkTypeStore,
        {provide: ArtworkTypeGateway, useValue: gatewayMock},
      ],
    });

    artworkTypeGateway = TestBed.inject(ArtworkTypeGateway);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialisation et Signaux Calculés', () => {
    it('should initialize with default empty state', () => {
      store = initStore();
      expect(store.artworkTypes()).toEqual([]);
      expect(store.searchTerm()).toEqual('');
      expect(store.isPending()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should return all types when no filter is active', () => {
      store = initStore({artworkTypes: getFreshMockTypes()});
      expect(store.filteredArtworkTypes().length).toBe(3);
    });
  });

  describe('Chargement des données (loadAll)', () => {
    it('should load all types and set status to fulfilled on success', () => {
      store = initStore();
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'getAll');

      store.loadAll();
      expect(store.isPending()).toBe(true);

      jest.runAllTimers();

      expect(store.isFulfilled()).toBe(true);
      expect(store.artworkTypes().length).toBe(3);
      expect(gatewaySpy).toHaveBeenCalledTimes(1);
    });

    it('should set an error on gateway failure', () => {
      store = initStore();
      const mockError = new Error('Failed to fetch');
      jest.spyOn(artworkTypeGateway, 'getAll').mockReturnValue(throwError(() => mockError));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      });

      store.loadAll();
      jest.runAllTimers();

      expect(store.artworkTypes().length).toBe(0);
      expect(store.error()).toBe("Échec du chargement des types d'œuvre");
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading artwork types data:', mockError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Opérations d\'écriture', () => {

    describe('add()', () => {
      it('should add a new artwork type on success', () => {
        store = initStore({artworkTypes: []});
        jest.spyOn(artworkTypeGateway, 'add').mockImplementation((artworkType) => of(artworkType));
        const addPayload = {name: 'Nouvelle Œuvre', basePrice: 100, profitMultiplier: 2};

        store.add(addPayload);
        jest.runAllTimers();

        expect(store.artworkTypes().length).toBe(1);
        expect(store.artworkTypes()[0].name.value).toBe('Nouvelle Œuvre');
        expect(store.isFulfilled()).toBe(true);
      });

      it('should set an error if domain validation fails and not call the gateway', () => {
        store = initStore();
        const gatewaySpy = jest.spyOn(artworkTypeGateway, 'add');
        const addPayload = {name: 'A', basePrice: 100, profitMultiplier: 2}; // Invalid name

        store.add(addPayload);
        jest.runAllTimers();

        expect(store.error()).toContain('Le nom doit contenir au moins 3 caractères.');
        expect(gatewaySpy).not.toHaveBeenCalled();
      });
    });

    describe('update()', () => {
      it('should optimistically update and set fulfilled on success', () => {
        store = initStore({artworkTypes: getFreshMockTypes()});
        const typeToUpdate = store.artworkTypes()[0];
        const updatePayload = {
          id: typeToUpdate.id,
          name: "Peinture à l'Huile V2",
          basePrice: typeToUpdate.basePrice.amount,
          profitMultiplier: typeToUpdate.profitMultiplier,
        };

        jest.spyOn(artworkTypeGateway, 'update').mockImplementation(artworkType => of(artworkType));

        store.update(updatePayload);

        const updatedTypeOptimistic = store.artworkTypes().find(at => at.id === typeToUpdate.id);
        expect(updatedTypeOptimistic?.name.value).toBe("Peinture à l'Huile V2");

        jest.runAllTimers();

        expect(store.isFulfilled()).toBe(true);
        const finalUpdatedType = store.artworkTypes().find(at => at.id === typeToUpdate.id);
        expect(finalUpdatedType?.name.value).toBe("Peinture à l'Huile V2");
      });

      it('should revert optimistic update on gateway failure', () => {
        store = initStore({artworkTypes: getFreshMockTypes()});
        const originalType = store.artworkTypes()[0];
        const originalName = originalType.name.value;

        const updatePayload = {
          id: originalType.id,
          name: 'Update qui va échouer',
          basePrice: originalType.basePrice.amount,
          profitMultiplier: originalType.profitMultiplier,
        };

        jest.spyOn(artworkTypeGateway, 'update').mockReturnValue(throwError(() => new Error('API Error')));

        store.update(updatePayload);
        jest.runAllTimers();

        expect(store.error()).toBe('API Error');
        expect(store.artworkTypes()[0].name.value).toBe(originalName);
      });

      it('should set an error if domain validation fails for update', () => {
        store = initStore({artworkTypes: getFreshMockTypes()});
        const gatewaySpy = jest.spyOn(artworkTypeGateway, 'update');
        const typeToUpdate = store.artworkTypes()[0];

        const updatePayload = {
          id: typeToUpdate.id,
          name: typeToUpdate.name.value,
          basePrice: typeToUpdate.basePrice.amount,
          profitMultiplier: 0.5,
        };

        store.update(updatePayload);
        jest.runAllTimers();

        expect(store.error()).toEqual(DomainErrors.ArtworkType.ProfitMultiplierMustBeAtLeastOne.message);
        expect(gatewaySpy).not.toHaveBeenCalled();
      });
    });

    describe('delete()', () => {
      it('should optimistically delete and set fulfilled on success', () => {
        store = initStore({artworkTypes: getFreshMockTypes()});
        const initialCount = store.artworkTypes().length;
        const typeToDelete = store.artworkTypes()[0];
        jest.spyOn(artworkTypeGateway, 'delete').mockReturnValue(of(undefined));

        store.delete(typeToDelete.id);

        expect(store.artworkTypes().length).toBe(initialCount - 1);
        expect(store.artworkTypes().find(at => at.id === typeToDelete.id)).toBeUndefined();

        jest.runAllTimers();
        expect(store.isFulfilled()).toBe(true);
      });

      it('should revert optimistic delete on gateway failure', () => {
        store = initStore({artworkTypes: getFreshMockTypes()});
        const initialArtworkTypes = [...store.artworkTypes()];
        const typeToDelete = store.artworkTypes()[0];
        jest.spyOn(artworkTypeGateway, 'delete').mockReturnValue(throwError(() => new Error('API Error')));

        store.delete(typeToDelete.id);
        jest.runAllTimers();

        expect(store.error()).toBe('API Error');
        expect(store.artworkTypes()).toEqual(initialArtworkTypes);
        expect(store.artworkTypes().length).toBe(initialArtworkTypes.length);
      });
    });
  });

  describe('Filtrage', () => {
    beforeEach(() => {
      store = initStore({artworkTypes: getFreshMockTypes(), searchTerm: ''});
    });

    it('should filter artwork types by a matching search term', () => {
      store.updateSearchTerm('Sculpture');

      expect(store.filteredCount()).toBe(1);
      expect(store.filteredArtworkTypes()[0].name.value).toBe('Sculpture sur Bois');
    });

    it('should return all types when the search term is cleared', () => {
      store.updateSearchTerm('Sculpture');
      expect(store.filteredCount()).toBe(1);

      store.updateSearchTerm('');
      expect(store.filteredCount()).toBe(3);
    });
  });
});
