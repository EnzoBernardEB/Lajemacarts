import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {By} from '@angular/platform-browser';
import {ArtworksHeaderComponent} from './artwork-header.component';

describe('ArtworksHeaderComponent', () => {
  let component: ArtworksHeaderComponent;
  let fixture: ComponentFixture<ArtworksHeaderComponent>;

  const renderComponent = (): void => {
    fixture = TestBed.createComponent(ArtworksHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const clickAddButton = (): void => {
    const button = fixture.debugElement.query(By.css('button'));
    button?.nativeElement?.click();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArtworksHeaderComponent,
        MatButtonModule,
        MatIconModule,
      ]
    }).compileComponents();
  });

  describe('User interaction', () => {
    it('should notify parent when user clicks add button', () => {
      const addClickedSpy = jest.fn();
      renderComponent();

      component.addClicked.subscribe(addClickedSpy);
      clickAddButton();

      expect(addClickedSpy).toHaveBeenCalledTimes(1);
    });
  });
});
