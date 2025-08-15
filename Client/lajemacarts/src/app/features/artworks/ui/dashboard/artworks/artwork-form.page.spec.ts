import {ComponentFixture, TestBed,} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {signal, WritableSignal} from '@angular/core';
import {RequestStatus} from '../../../../../shared/store/request-status.features';
import {Artwork} from '../../../domain/models/artwork';
import {
  ArtworkCreationPayloadWithFiles,
  UpdateArtworkPayloadWithFiles
} from "../../../application/store/artwork/artwork.types";
import {WeightCategory} from '../../../domain/models/enums/enums';
import {mockArtworks, mockArtworkTypes, mockMaterials} from '../../../application/store/artwork/artwork.mocks';
import {ArtworkFormPage} from './artwork-form.page';
import {ArtworkStore} from '../../../application/store/artwork/artwork.store';
import {ArtworkFormComponent, ArtworkFormValue} from './components/artwork-form/artwork-form';
import {By} from '@angular/platform-browser';
import {MediaUploadComponent} from './components/media-upload/media-upload.component';

class MockArtworkStore {
  artworks: WritableSignal<Artwork[]> = signal(mockArtworks);
  artworkTypes = signal(mockArtworkTypes);
  materials = signal(mockMaterials);
  requestStatus: WritableSignal<RequestStatus> = signal('idle');

  loadAllData = jest.fn();
  addArtwork = jest.fn();
  updateArtwork = jest.fn();
}

const mockRouter = {
  navigate: jest.fn(),
};

const mockSnackBar = {
  open: jest.fn(),
};

describe('ArtworkFormPage', () => {
  let fixture: ComponentFixture<ArtworkFormPage>;
  let component: ArtworkFormPage;
  let store: MockArtworkStore;

  async function setupTest(routeId: string | null) {
    await TestBed.configureTestingModule({
      imports: [ArtworkFormPage],
      providers: [
        provideNoopAnimations(),
        {provide: ArtworkStore, useClass: MockArtworkStore},
        {provide: Router, useValue: mockRouter},
        {provide: MatSnackBar, useValue: mockSnackBar},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? routeId : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworkFormPage);
    component = fixture.componentInstance;
    store = TestBed.inject(ArtworkStore) as unknown as MockArtworkStore;

    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialisation', () => {
    it('devrait appeler loadAllData au démarrage', async () => {
      await setupTest(null);
      expect(store.loadAllData).toHaveBeenCalled();
    });

    it('devrait être en mode création si aucun ID n\'est fourni dans l\'URL', async () => {
      await setupTest(null);
      expect(component.isEditMode()).toBe(false);
    });

    it('devrait être en mode édition si un ID est fourni dans l\'URL', async () => {
      const artworkId = mockArtworks[0].id;
      await setupTest(artworkId);
      expect(component.isEditMode()).toBe(true);
    });
  });

  describe('Mode Création', () => {
    beforeEach(async () => {
      await setupTest(null);
    });

    it('devrait appeler store.addArtwork avec la bonne charge utile lors de la sauvegarde', () => {
      const formValue: ArtworkFormValue = {
        name: 'Nouvelle Oeuvre',
        description: 'Description de test',
        artworkTypeId: mockArtworkTypes[0].id,
        materials: [{materialId: mockMaterials[0].id, quantity: 10}],
        dimensions: {length: 10, width: 10, height: 10, unit: 'cm'},
        weightCategory: WeightCategory.Light,
        hoursSpent: 5,
        creationYear: 2025,
        sellingPrice: 100,
        status: 'Draft',
      };

      const files = [new File([''], 'test-image.png')];
      component.handleMediaSelection(files);
      component.onSave(formValue);

      expect(store.addArtwork).toHaveBeenCalledTimes(1);
      const expectedPayload: Partial<ArtworkCreationPayloadWithFiles> = {
        name: formValue.name,
        files: files,
      };
      expect(store.addArtwork).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
    });
  });

  describe('Mode Édition', () => {
    const artworkToEdit = mockArtworks[0];

    beforeEach(async () => {
      await setupTest(artworkToEdit.id);
    });

    it('devrait charger les données de l\'œuvre à éditer', () => {
      expect(component.artworkToEdit()).toBe(artworkToEdit);
    });

    it('devrait appeler store.updateArtwork avec la bonne charge utile lors de la sauvegarde', () => {
      const formValue: ArtworkFormValue = {
        name: 'Oeuvre Modifiée',
        description: artworkToEdit.description.value,
        artworkTypeId: artworkToEdit.artworkTypeId,
        materials: artworkToEdit.materials.map(m => ({materialId: m.materialId, quantity: m.quantity})),
        dimensions: {...artworkToEdit.dimensions},
        weightCategory: artworkToEdit.weightCategory,
        hoursSpent: artworkToEdit.hoursSpent,
        creationYear: artworkToEdit.creationYear,
        sellingPrice: artworkToEdit.sellingPrice.amount,
        status: 'InStock',
      };

      const files = [new File([''], 'new-image.png')];
      component.handleMediaSelection(files);
      component.onSave(formValue);

      expect(store.updateArtwork).toHaveBeenCalledTimes(1);
      const expectedPayload: Partial<UpdateArtworkPayloadWithFiles> = {
        id: artworkToEdit.id,
        name: 'Oeuvre Modifiée',
        files: files,
      };
      expect(store.updateArtwork).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
    });
  });

  describe('Effets de Sauvegarde (effect)', () => {

    const MOCK_FORM_VALUE: ArtworkFormValue = {
      name: 'Test',
      description: 'Test',
      artworkTypeId: '1',
      materials: [], // Propriété requise, même si vide
      dimensions: {length: 0, width: 0, height: 0, unit: 'cm'},
      weightCategory: WeightCategory.Light,
      hoursSpent: 0,
      creationYear: 2024,
      sellingPrice: 0,
      status: 'Draft',
    };

    it('devrait afficher une snackbar de succès et réinitialiser le formulaire en mode création', async () => {
      await setupTest(null);

      // On espionne les méthodes des VRAIS composants enfants
      const artworkFormComponent = fixture.debugElement.query(By.directive(ArtworkFormComponent)).componentInstance;
      const mediaUploadComponent = fixture.debugElement.query(By.directive(MediaUploadComponent)).componentInstance;
      const resetFormSpy = jest.spyOn(artworkFormComponent, 'resetForm').mockImplementation(() => {
      });
      const resetMediaSpy = jest.spyOn(mediaUploadComponent, 'reset').mockImplementation(() => {
      });

      component.onSave(MOCK_FORM_VALUE);
      expect(component['isSaving']()).toBe(true);

      store.requestStatus.set('fulfilled');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('créée avec succès'), 'OK', expect.any(Object));
      expect(resetFormSpy).toHaveBeenCalled();
      expect(resetMediaSpy).toHaveBeenCalled();
      expect(component['isSaving']()).toBe(false);
    });

    it('devrait afficher une snackbar de succès et naviguer en mode édition', async () => {
      await setupTest(mockArtworks[0].id);

      component.onSave(MOCK_FORM_VALUE);
      store.requestStatus.set('fulfilled');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('mise à jour avec succès'), 'OK', expect.any(Object));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tableau-de-bord/artworks']);
      expect(component['isSaving']()).toBe(false);
    });

    it('devrait afficher une snackbar d\'erreur en cas d\'échec de la sauvegarde', async () => {
      await setupTest(null);

      component.onSave(MOCK_FORM_VALUE);
      const error = {error: 'Erreur de base de données'};
      store.requestStatus.set(error);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringContaining('Échec de l\'opération : Erreur de base de données'), 'Fermer', expect.any(Object));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(component['isSaving']()).toBe(false);
    });
  });
});
