import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MaterialFormComponent} from './material-form.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

describe('MaterialFormComponent', () => {
    let component: MaterialFormComponent;
    let fixture: ComponentFixture<MaterialFormComponent>;
    let dialogRef: MatDialogRef<MaterialFormComponent>;

    const mockDialogRef = {
        close: jest.fn(),
    };

    async function setupTest(dialogData: any = null) {
        await TestBed.configureTestingModule({
            imports: [MaterialFormComponent, ReactiveFormsModule],
            providers: [
                provideNoopAnimations(),
                {provide: MatDialogRef, useValue: mockDialogRef},
                {provide: MAT_DIALOG_DATA, useValue: dialogData},
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MaterialFormComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef);
        fixture.detectChanges();
    }

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', async () => {
        await setupTest();
        expect(component).toBeTruthy();
    });

    describe('Creation Mode', () => {
        beforeEach(async () => {
            await setupTest(null);
        });

        it('should display "Ajouter un Matériau" title', () => {
            const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
            expect(title).toContain('Ajouter un Matériau');
        });

        it('should initialize form with empty values', () => {
            expect(component.form.value).toEqual({
                name: '',
                pricePerUnit: 0,
                unit: '',
            });
        });

        it('should close dialog on cancel', () => {
            component.onCancel();
            expect(dialogRef.close).toHaveBeenCalled();
        });

        it('should close dialog with form data on valid save', () => {
            component.form.setValue({
                name: 'Test Material',
                pricePerUnit: 10.5,
                unit: 'kg',
            });
            component.onSave();
            expect(dialogRef.close).toHaveBeenCalledWith({
                name: 'Test Material',
                pricePerUnit: 10.5,
                unit: 'kg',
            });
        });

        it('should not close dialog on invalid save', () => {
            component.form.setValue({
                name: '',
                pricePerUnit: 10.5,
                unit: 'kg',
            });
            component.onSave();
            expect(dialogRef.close).not.toHaveBeenCalled();
        });
    });

    describe('Validation', () => {
        beforeEach(async () => {
            await setupTest();
        });

        it('should show required error for name field', () => {
            component.name.setValue('');
            component.name.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('Le nom est requis.');
        });

        it('should show minlength error for name field', () => {
            component.name.setValue('ab');
            component.name.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('Le nom doit contenir au moins 3 caractères.');
        });

        it('should show required error for pricePerUnit field', () => {
            component.pricePerUnit.setValue(null);
            component.pricePerUnit.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('Le prix est requis.');
        });

        it('should show min error for pricePerUnit field', () => {
            component.pricePerUnit.setValue(0);
            component.pricePerUnit.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('Le prix doit être positif.');
        });

        it('should show required error for unit field', () => {
            component.unit.setValue('');
            component.unit.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('L\'unité est requise.');
        });

        it('should show minlength error for unit field', () => {
            component.unit.setValue('');
            component.unit.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent;
            expect(error).toContain('L\'unité est requise.');
        });
    });

    describe('Edit Mode', () => {
        const mockMaterialData = {
            id: '1',
            name: 'Existing Material',
            pricePerUnit: 50.0,
            unit: 'm',
        };

        beforeEach(async () => {
            await setupTest(mockMaterialData);
        });

        it('should display "Modifier le Matériau" title', () => {
            const title = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
            expect(title).toContain('Modifier le Matériau');
        });

        it('should initialize form with provided data', () => {
            expect(component.form.value).toEqual({
                name: mockMaterialData.name,
                pricePerUnit: mockMaterialData.pricePerUnit,
                unit: mockMaterialData.unit,
            });
        });

        it('should close dialog with updated form data on valid save', () => {
            const updatedName = 'Updated Material';
            component.form.setValue({
                name: updatedName,
                pricePerUnit: mockMaterialData.pricePerUnit,
                unit: mockMaterialData.unit,
            });
            component.onSave();
            expect(dialogRef.close).toHaveBeenCalledWith({
                name: updatedName,
                pricePerUnit: mockMaterialData.pricePerUnit,
                unit: mockMaterialData.unit,
            });
        });
    });
});
