import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, StateSignals } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { of, throwError } from 'rxjs';

import { MaterialGateway } from '../../../domain/ ports/material.gateway';
import { MaterialInMemoryGateway } from '../../../infrastructure/gateway/material-in-memory.gateway';
import { MaterialStore } from './material.store';
import { Material } from '../../../domain/models/material';
import { DomainErrors } from '../../../../../shared/domain/errors/domain-errors';
import {Name} from '../../../domain/models/value-objects/name';
import {Money} from '../../../domain/models/value-objects/money.model';

export const mockMaterials: Material[] = [
  Material.hydrate({ id: '1', name: Name.hydrate('Résine Époxy'), pricePerUnit: Money.hydrate(30), unit: 'kg' }),
  Material.hydrate({ id: '2', name: Name.hydrate('Bois de Chêne'), pricePerUnit: Money.hydrate(50), unit: 'planche' }),
  Material.hydrate({ id: '3', name: Name.hydrate('Fleurs Séchées'), pricePerUnit: Money.hydrate(15), unit: 'botte' }),
  Material.hydrate({ id: '4', name: Name.hydrate('Pigment Bleu'), pricePerUnit: Money.hydrate(10), unit: 'pot' }),
  Material.hydrate({ id: '5', name: Name.hydrate('Métal Recyclé'), pricePerUnit: Money.hydrate(25), unit: 'kg' }),
];

function initStore(partial?: Partial<StateSignals<typeof MaterialStore>>) {
  const store = TestBed.inject(MaterialStore);
  patchState(unprotected(store), partial ?? {});
  return store;
}

describe('MaterialStore', () => {
  let materialGateway: MaterialGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MaterialStore,
        { provide: MaterialGateway, useClass: MaterialInMemoryGateway },
      ],
    });
    materialGateway = TestBed.inject(MaterialGateway);
  });

  it('should initialize with default empty state', () => {
    const store = initStore();
    expect(store.materials()).toEqual([]);
    expect(store.searchTerm()).toEqual('');
  });

  describe('LoadAll Logic', () => {
    it('should load all materials and set status to fulfilled on success', fakeAsync(() => {
      const store = initStore();
      jest.spyOn(materialGateway, 'getAll').mockReturnValue(of(mockMaterials));

      store.loadAll();
      tick();

      expect(store.materials()).toEqual(mockMaterials);
      expect(store.isFulfilled()).toBe(true);
    }));

    it('should set status to an error object on gateway failure', fakeAsync(() => {
      const store = initStore();
      jest.spyOn(materialGateway, 'getAll').mockReturnValue(throwError(() => new Error('Failed to fetch')));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.loadAll();
      tick();

      expect(store.error()).toBe('Échec du chargement des données');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    }));
  });

  describe('Filtering Logic', () => {
    it('should filter materials by a matching search term', () => {
      const store = initStore({ materials: mockMaterials });
      store.updateSearchTerm('Résine');
      expect(store.filteredCount()).toBe(1);
      expect(store.filteredMaterials()[0].name.value).toBe('Résine Époxy');
    });
  });

  describe('Add Logic', () => {
    it('should add a new material and set status to fulfilled on success', fakeAsync(() => {
      const store = initStore({ materials: [] });
      jest.spyOn(materialGateway, 'add').mockImplementation(material => of(material));
      const payload = { name: 'Toile de Lin', pricePerUnit: 25, unit: 'm²' };

      store.add(payload);
      tick();

      expect(store.materials().length).toBe(1);
      expect(store.materials()[0].name.value).toBe('Toile de Lin');
      expect(store.isFulfilled()).toBe(true);
    }));

    it('should set error if domain validation fails during add', fakeAsync(() => {
      const store = initStore();
      const gatewaySpy = jest.spyOn(materialGateway, 'add');
      const payload = { name: 'A', pricePerUnit: 10, unit: 'kg' };

      store.add(payload);
      tick();

      expect(store.error()).toContain('Le nom doit contenir au moins 3 caractères.');
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));
  });

  describe('Update Logic', () => {
    const getInitialMaterials = () => mockMaterials.map(m => Material.hydrate({
      id: m.id,
      name: m.name,
      pricePerUnit: m.pricePerUnit,
      unit: m.unit
    }));
    it('should optimistically update and set status to fulfilled on success', fakeAsync(() => {
      const initialMaterials = getInitialMaterials();
      const store = initStore({ materials: initialMaterials });
      const materialToUpdate = initialMaterials[0];
      jest.spyOn(materialGateway, 'update').mockImplementation(material => of(material));
      const payload = { id: materialToUpdate.id, name: 'Résine V2', pricePerUnit: 35, unit: 'L' };

      store.update(payload);

      expect(store.materials()[0].name.value).toBe('Résine V2');

      tick();
      expect(store.isFulfilled()).toBe(true);
    }));

    it('should revert optimistic update and set error on gateway failure', fakeAsync(() => {
      const initialMaterials = getInitialMaterials();
      const store = initStore({ materials: initialMaterials });
      const originalMaterial = initialMaterials[0];
      jest.spyOn(materialGateway, 'update').mockReturnValue(throwError(() => new Error('API Error')));
      const payload = { id: originalMaterial.id, name: 'Update qui échoue', pricePerUnit: 99, unit: 'fail' };

      store.update(payload);
      tick();

      expect(store.error()).toBe('API Error');
      expect(store.materials()[0].name.value).toBe(originalMaterial.name.value);
    }));

    it('should set error if domain validation for unit fails', fakeAsync(() => {
      const store = initStore({ materials: getInitialMaterials() });
      const gatewaySpy = jest.spyOn(materialGateway, 'update');
      const payload = { id: '1', name: 'Nom Valide', pricePerUnit: 25, unit: '' };

      store.update(payload);
      tick();

      expect(store.error()).toEqual(DomainErrors.Material.UnitRequired.message);
      expect(gatewaySpy).not.toHaveBeenCalled();
    }));
  });

  describe('Delete Logic', () => {
    const getInitialMaterials = () => mockMaterials.map(m => Material.hydrate({
      id: m.id,
      name: m.name,
      pricePerUnit: m.pricePerUnit,
      unit: m.unit
    }));
    it('should optimistically delete and set status to fulfilled on success', fakeAsync(() => {
      const initialMaterials = getInitialMaterials();
      const store = initStore({ materials: initialMaterials });
      const idToDelete = initialMaterials[0].id;
      jest.spyOn(materialGateway, 'delete').mockReturnValue(of(undefined));

      store.delete(idToDelete);

      expect(store.materials().length).toBe(mockMaterials.length - 1);

      tick();
      expect(store.isFulfilled()).toBe(true);
    }));

    it('should revert optimistic delete and set error on gateway failure', fakeAsync(() => {
      const initialMaterials = getInitialMaterials();
      const store = initStore({ materials: initialMaterials });
      const idToDelete = initialMaterials[0].id;
      jest.spyOn(materialGateway, 'delete').mockReturnValue(throwError(() => new Error('API Error')));

      store.delete(idToDelete);
      tick();

      expect(store.error()).toBe('API Error');
      expect(store.materials().length).toBe(mockMaterials.length);
    }));
  });
});
