import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {MatButtonModule} from '@angular/material/button';
import {provideRouter} from "@angular/router";
import {By} from "@angular/platform-browser";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        MatButtonModule
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a welcome message', () => {
    const welcomeMessage = fixture.debugElement.query(By.css('.home-container h1'));
    expect(welcomeMessage.nativeElement.textContent).toContain('Bienvenue sur Lajemacarts');
  });

  it('should have a link to the gallery', () => {
    const galleryLink = fixture.debugElement.query(By.css('a[routerLink="/galerie"]'));
    expect(galleryLink).toBeTruthy();
    expect(galleryLink.nativeElement.textContent).toContain('Découvrir la galerie');
  });

  it('should have a link to the dashboard', () => {
    const dashboardLink = fixture.debugElement.query(By.css('a[routerLink="/tableau-de-bord"]'));
    expect(dashboardLink).toBeTruthy();
    expect(dashboardLink.nativeElement.textContent).toContain('Accéder au tableau de bord');
  });
});
