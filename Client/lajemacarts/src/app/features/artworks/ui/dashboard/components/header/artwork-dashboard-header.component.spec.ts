import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ArtworkDashboardHeaderComponent} from './artwork-dashboard-header.component';

describe('ArtworkDashboardHeaderComponent', () => {
  let component: ArtworkDashboardHeaderComponent;
  let fixture: ComponentFixture<ArtworkDashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkDashboardHeaderComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworkDashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default title and button text on initialization', () => {
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(titleElement.textContent).toContain('Titre de la Page');
    expect(buttonElement.textContent).toContain('Ajouter');
  });

  it('should display the provided title and button text from inputs', () => {
    const newTitle = 'Ma Galerie d\'Œuvres';
    const newButtonText = 'Créer une œuvre';
    fixture.componentRef.setInput('title', newTitle);
    fixture.componentRef.setInput('addButtonText', newButtonText);

    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(titleElement.textContent).toContain(newTitle);
    expect(buttonElement.textContent).toContain(newButtonText);
  });

  it('should emit addClicked event when the button is clicked', () => {
    const addClickedSpy = jest.spyOn(component.addClicked, 'emit');
    const buttonElement = fixture.debugElement.query(By.css('button.add-item-btn'));

    buttonElement.triggerEventHandler('click', null);

    expect(addClickedSpy).toHaveBeenCalledTimes(1);
  });
});
