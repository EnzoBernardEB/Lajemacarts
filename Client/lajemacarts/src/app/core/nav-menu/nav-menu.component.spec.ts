import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NavMenuComponent} from './nav-menu.component';
import {By} from '@angular/platform-browser';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {provideRouter} from '@angular/router';

describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let fixture: ComponentFixture<NavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavMenuComponent,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the application title', () => {
    const titleElement = fixture.debugElement.query(By.css('.logo-title span'));
    expect(titleElement.nativeElement.textContent).toContain('Lajemac-Arts');
  });

  it('should have a link to the home page', () => {
    const allLinks = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const homeLink = allLinks.find(a => a.nativeElement.textContent.trim() === 'Accueil');
    expect(homeLink).toBeTruthy();
  });

  it('should have a link to the artworks dashboard', () => {
    const allLinks = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const artworksLink = allLinks.find(a => a.nativeElement.textContent.trim() === 'Tableau de bord');
    expect(artworksLink).toBeTruthy();
  });

  it('should have a link to the artworks gallery', () => {
    const allLinks = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const galleryLink = allLinks.find(a => a.nativeElement.textContent.trim() === 'Galerie');
    expect(galleryLink).toBeTruthy();
  });

  it('should have a link to the materials page', () => {
    const allLinks = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const materialsLink = allLinks.find(a => a.nativeElement.textContent.trim() === 'Matériaux');
    expect(materialsLink).toBeTruthy();
  });

  it('should have a link to home on the logo', () => {
    const logoLink = fixture.debugElement.query(By.css('a.logo-title'));
    expect(logoLink).toBeTruthy();
    expect(logoLink.attributes['routerLink']).toBe('/');
  });
});
