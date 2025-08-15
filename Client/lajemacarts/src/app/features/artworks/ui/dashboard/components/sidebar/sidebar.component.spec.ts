import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SidebarComponent} from './sidebar.component';
import {By} from '@angular/platform-browser';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {provideRouter} from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display navigation links', () => {
    const navLinks = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    expect(navLinks.length).toBeGreaterThan(0);

    const linkTexts = navLinks.map(link => link.query(By.css('span')).nativeElement.textContent.trim());
    expect(linkTexts).toContain('Artworks');
    expect(linkTexts).toContain('Materials');
    expect(linkTexts).toContain('Types');
  });

  it('should have correct routerLink for "Œuvres"', () => {
    const artworkLink = fixture.debugElement.query(By.css('a[routerLink="/tableau-de-bord/artworks"]'));
    expect(artworkLink).toBeTruthy();
  });

  it('should have correct routerLink for "Types d\'œuvres"', () => {
    const artworkTypeLink = fixture.debugElement.query(By.css('a[routerLink="/tableau-de-bord/artwork-types"]'));
    expect(artworkTypeLink).toBeTruthy();
  });

  it('should have correct routerLink for "Matériaux"', () => {
    const materialLink = fixture.debugElement.query(By.css('a[routerLink="/tableau-de-bord/materials"]'));
    expect(materialLink).toBeTruthy();
  });
});
