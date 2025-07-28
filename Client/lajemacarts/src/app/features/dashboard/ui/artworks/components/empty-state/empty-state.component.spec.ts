import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {By} from '@angular/platform-browser';
import {ArtworksEmptyStateComponent} from './empty-state.component';

describe('ArtworksEmptyStateComponent', () => {
  let component: ArtworksEmptyStateComponent;
  let fixture: ComponentFixture<ArtworksEmptyStateComponent>;

  const renderComponent = (inputs: Partial<ComponentInputs> = {}): void => {
    fixture = TestBed.createComponent(ArtworksEmptyStateComponent);
    component = fixture.componentInstance;

    Object.entries(inputs).forEach(([key, value]) => {
      fixture.componentRef.setInput(key, value);
    });

    fixture.detectChanges();
  };

  const clickButton = (): void => {
    const button = fixture.debugElement.query(By.css('button'));
    button?.nativeElement?.click();
  };

  const isButtonVisible = (): boolean => {
    return !!fixture.debugElement.query(By.css('button'));
  };

  interface ComponentInputs {
    showButton: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArtworksEmptyStateComponent,
        MatIconModule,
        MatButtonModule,
      ]
    }).compileComponents();
  });

  describe('User interaction', () => {
    it('should notify parent when user clicks the button', () => {
      const buttonClickSpy = jest.fn();
      renderComponent();

      component.buttonClick.subscribe(buttonClickSpy);
      clickButton();

      expect(buttonClickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button visibility control', () => {
    it('should hide button when showButton is false', () => {
      renderComponent({showButton: false});

      expect(isButtonVisible()).toBe(false);
    });

    it('should display button when showButton is true', () => {
      renderComponent({showButton: true});

      expect(isButtonVisible()).toBe(true);
    });
  });

  describe('State/interaction consistency', () => {
    it('should not allow interaction when button is hidden', () => {
      const buttonClickSpy = jest.fn();
      renderComponent({showButton: false});

      component.buttonClick.subscribe(buttonClickSpy);

      // User cannot click on what doesn't exist
      expect(isButtonVisible()).toBe(false);
      expect(buttonClickSpy).not.toHaveBeenCalled();
    });
  });
});
