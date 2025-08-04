import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, StateSignals } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import {delay, of, Subject, throwError} from 'rxjs';

import { ArtworkTypeStore } from './artwork-type.store';
import { ArtworkTypeGateway } from '../../../domain/ ports/artwork-type.gateway';
import { ArtworkTypeInMemoryGateway } from '../../../infrastructure/gateway/artwork-type-in-memory.gateway';
import { ArtworkType } from '../../../domain/models/artwork-type';
import { Name } from '../../../domain/models/value-objects/name';
import { Money } from '../../../domain/models/value-objects/money.model';
import { DomainErrors } from '../../../../../shared/domain/errors/domain-errors';

const MOCK_ARTWORK_TYPES: ArtworkType[] = [
  ArtworkType.hydrate({ id: '1', name: Name.hydrate('Peinture Acrylique'), basePrice: Money.hydrate(20), profitMultiplier: 2.5 }),
  ArtworkType.hydrate({ id: '2', name: Name.hydrate('Sculpture sur Bois'), basePrice: Money.hydrate(150), profitMultiplier: 1.8 }),
  ArtworkType.hydrate({ id: '3', name: Name.hydrate('Aquarelle'), basePrice: Money.hydrate(35), profitMultiplier: 3.0 }),
  ArtworkType.hydrate({ id: '4', name: Name.hydrate('Résine Époxy'), basePrice: Money.hydrate(90), profitMultiplier: 2.2 }),
  ArtworkType.hydrate({ id: '5', name: Name.hydrate('Photographie Argentique'), basePrice: Money.hydrate(50), profitMultiplier: 2.8 }),
];

function initStore(partial?: Partial<StateSignals<typeof ArtworkTypeStore>>) {
  const store = TestBed.inject(ArtworkTypeStore);
  patchState(unprotected(store), partial ?? {});
  return store;
}

describe('ArtworkTypeStore', () => {
  let artworkTypeGateway: ArtworkTypeGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArtworkTypeStore,
        { provide: ArtworkTypeGateway, useClass: ArtworkTypeInMemoryGateway },
      ],
    });
    artworkTypeGateway = TestBed.inject(ArtworkTypeGateway);
  });

  it('should initialize with default empty state', () => {
    const store = initStore();
    expect(store.artworkTypes()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
  });

  describe('LoadAll Logic', () => {
    it('should load all artwork types and set status to fulfilled on success', fakeAsync(() => {
      const store = initStore();

      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'getAll').mockReturnValue(of(MOCK_ARTWORK_TYPES).pipe(delay(0)));

      store.loadAll();

      expect(store.isPending()).toBe(true);

      tick();

      expect(store.artworkTypes()).toEqual(MOCK_ARTWORK_TYPES);
      expect(store.isFulfilled()).toBe(true);
      expect(gatewaySpy).toHaveBeenCalledTimes(1);
    }));

    it('should set status to an error object on gateway failure', fakeAsync(() => {
      const store = initStore();
      const errorSubject = new Subject<ArtworkType[]>();
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'getAll').mockReturnValue(errorSubject.asObservable());
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.loadAll();

      expect(store.isPending()).toBe(true);
      expect(store.error()).toBeNull();

      const mockError = new Error('Failed to fetch');
      errorSubject.error(mockError);
      tick();

      expect(store.artworkTypes().length).toBe(0);
      expect(store.isPending()).toBe(false);

      const expectedErrorState = { error: 'Échec du chargement des données' };
      expect(store.requestStatus()).toEqual(expectedErrorState);
      expect(store.error()).toBe('Échec du chargement des données');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading artwork types data:', mockError);

      consoleErrorSpy.mockRestore();
    }));
  });

  describe('Filtering Logic', () => {
    it('should filter artwork types by a matching search term', () => {
      const store = initStore({ artworkTypes: MOCK_ARTWORK_TYPES });
      store.updateSearchTerm('Résine');
      expect(store.filteredCount()).toBe(1);
      expect(store.filteredArtworkTypes()[0].name.value).toBe('Résine Époxy');
    });
  });

  describe('Add Logic', () => {
    it('should add a new artwork type and set status to fulfilled on success', fakeAsync(() => {
      const store = initStore({ artworkTypes: [] });
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'add')
        .mockImplementation(artworkType => of(artworkType).pipe(delay(0)));

      const addPayload = { name: 'Nouvelle Œuvre', basePrice: 100, profitMultiplier: 2 };

      store.add(addPayload);

      expect(store.isPending()).toBe(true);
      tick();

      expect(store.artworkTypes().length).toBe(1);
      expect(store.artworkTypes()[0].name.value).toBe('Nouvelle Œuvre');
      expect(store.isFulfilled()).toBe(true);
      expect(gatewaySpy).toHaveBeenCalledTimes(1);
    }));

    it('should set error on gateway failure during add', fakeAsync(() => {
      const store = initStore({ artworkTypes: [] });
      jest.spyOn(artworkTypeGateway, 'add').mockReturnValue(throwError(() => new Error('Gateway error')));

      const addPayload = { name: 'Œuvre Valide', basePrice: 100, profitMultiplier: 2 };
      store.add(addPayload);
      tick();

      expect(store.artworkTypes().length).toBe(0);
      expect(store.error()).toBe('Gateway error');
    }));

    it('should set error if domain validation fails during add and not call the gateway', fakeAsync(() => {
      const store = initStore();
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'add');

      const addPayload = { name: 'A', basePrice: 100, profitMultiplier: 2 };
      store.add(addPayload);
      tick();

      expect(store.error()).toContain('Le nom doit contenir au moins 3 caractères.');
      expect(store.artworkTypes().length).toBe(0);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));
  });

  describe('Update Logic', () => {
    const getInitialTypes = () => MOCK_ARTWORK_TYPES.map(at => ArtworkType.hydrate({
      id: at.id,
      name: at.name,
      basePrice: at.basePrice,
      profitMultiplier: at.profitMultiplier
    }));

    it('should optimistically update and set status to fulfilled on success', fakeAsync(() => {
      const initialTypes = getInitialTypes();
      const store = initStore({ artworkTypes: initialTypes });
      const typeToUpdate = initialTypes[0];

      const gatewaySuccess$ = new Subject<ArtworkType>();
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'update').mockReturnValue(gatewaySuccess$.asObservable());

      const updatePayload = {
        id: typeToUpdate.id,
        name: 'Peinture à l\'Huile V2',
        basePrice: 25,
        profitMultiplier: 2.2
      };

      store.update(updatePayload);
      tick();

      expect(store.isPending()).toBe(true);
      const updatedType = store.artworkTypes().find(at => at.id === typeToUpdate.id);
      expect(updatedType?.name.value).toBe('Peinture à l\'Huile V2');

      const returnedArtworkType = gatewaySpy.mock.calls[0][0];
      gatewaySuccess$.next(returnedArtworkType);
      gatewaySuccess$.complete();
      tick();

      expect(store.isFulfilled()).toBe(true);
    }));

    it('should revert optimistic update and set error on gateway failure', fakeAsync(() => {
      const initialTypes = getInitialTypes();
      const store = initStore({ artworkTypes: initialTypes });
      const originalType = initialTypes[0];

      const gatewayError$ = new Subject<ArtworkType>();
      jest.spyOn(artworkTypeGateway, 'update').mockReturnValue(gatewayError$.asObservable());

      const updatePayload = { id: originalType.id, name: 'Update qui va échouer', basePrice: 99, profitMultiplier: 3 };

      store.update(updatePayload);
      tick();

      expect(store.isPending()).toBe(true);
      expect(store.artworkTypes()[0].name.value).toBe('Update qui va échouer');

      gatewayError$.error({ message: 'Network error' });
      tick();

      expect(store.error()).toBe('Network error');
      expect(store.artworkTypes()[0].name.value).toBe(originalType.name.value);
    }));

    it('should set error if domain validation for name fails', fakeAsync(() => {
      const store = initStore({ artworkTypes: getInitialTypes() });
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'update');

      const updatePayload = { id: '1', name: '', basePrice: 25, profitMultiplier: 2.2 };

      store.update(updatePayload);
      tick();

      expect(store.error()).toContain('Le nom est requis.');
      expect(store.isPending()).toBe(false);
      expect(store.isFulfilled()).toBe(false);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));

    it('should set error if domain validation for profitMultiplier fails', fakeAsync(() => {
      const store = initStore({ artworkTypes: getInitialTypes() });
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'update');

      const updatePayload = { id: '1', name: 'Nom Valide', basePrice: 25, profitMultiplier: 0.5 };

      store.update(updatePayload);
      tick();

      expect(store.error()).toEqual(DomainErrors.ArtworkType.ProfitMultiplierMustBeAtLeastOne.message);
      expect(store.isPending()).toBe(false);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));

    it('should set an error if trying to update a non-existent artwork type', fakeAsync(() => {
      const store = initStore({ artworkTypes: getInitialTypes() });
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'update');

      const updatePayload = { id: 'id-inexistant', name: 'Test', basePrice: 1, profitMultiplier: 1 };

      store.update(updatePayload);
      tick();

      expect(store.error()).toBe('Type d\'œuvre non trouvé.');
      expect(store.isPending()).toBe(false);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));
  });
  describe('Delete Logic', () => {
    // --- CORRECTION : On utilise la même méthode d'isolation que pour 'Update' ---
    const getInitialTypes = () => MOCK_ARTWORK_TYPES.map(at => ArtworkType.hydrate({
      id: at.id,
      name: at.name,
      basePrice: at.basePrice,
      profitMultiplier: at.profitMultiplier
    }));

    it('should optimistically delete and set status to fulfilled on success', fakeAsync(() => {
      const initialTypes = getInitialTypes(); // On utilise des données fraîches
      const store = initStore({ artworkTypes: initialTypes });
      const typeToDelete = initialTypes[0];

      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'delete').mockReturnValue(of(undefined).pipe(delay(0)));

      expect(store.artworkTypes().length).toBe(5);

      store.delete(typeToDelete.id);
      tick();

      expect(store.artworkTypes().length).toBe(4);
      expect(store.artworkTypes().find(at => at.id === typeToDelete.id)).toBeUndefined();
      expect(store.isPending()).toBe(false);
      expect(store.isFulfilled()).toBe(true);
      expect(gatewaySpy).toHaveBeenCalledWith(typeToDelete.id);
    }));

    it('should revert optimistic delete and set error on gateway failure', fakeAsync(() => {
      const initialTypes = getInitialTypes(); // On utilise des données fraîches
      const store = initStore({ artworkTypes: initialTypes });
      const typeToDelete = initialTypes[0];

      const gatewayError$ = throwError(() => new Error('API Error'));
      jest.spyOn(artworkTypeGateway, 'delete').mockReturnValue(gatewayError$);

      store.delete(typeToDelete.id);
      tick();

      expect(store.artworkTypes().length).toBe(5);
      expect(store.artworkTypes()[0].id).toBe(typeToDelete.id);
      expect(store.error()).toBe('API Error');
    }));

    it('should set an error if trying to delete a non-existent artwork type', fakeAsync(() => {
      const store = initStore({ artworkTypes: getInitialTypes() }); // On utilise des données fraîches
      const gatewaySpy = jest.spyOn(artworkTypeGateway, 'delete');

      store.delete('id-inexistant');
      tick();

      expect(store.error()).toBe('Type d\'œuvre non trouvé pour la suppression.');
      expect(store.isPending()).toBe(false);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));
  });
});
