import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NotFoundComponent} from './not-found.component';
import {By} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {provideRouter} from '@angular/router';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        MatButtonModule
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a "Page Not Found" message', () => {
    const h1Element = fixture.debugElement.query(By.css('mat-card-title'));
    expect(h1Element.nativeElement.textContent).toContain('404 - Page non trouvée');
  });

  it('should display a descriptive message', () => {
    const pElement = fixture.debugElement.query(By.css('mat-card-content p'));
    expect(pElement.nativeElement.textContent).toContain('Désolé, la page que vous cherchez n\'existe pas.');
  });

  it('should have a "Go to Home" button', () => {
    const button = fixture.debugElement.query(By.css('mat-card-actions a[mat-button]'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Aller à l\'accueil');
  });

  it('should have a link that points to the home page', () => {
    const button = fixture.debugElement.query(By.css('mat-card-actions a[mat-button]'));
    expect(button.nativeElement.pathname).toBe('/');
  });
});
