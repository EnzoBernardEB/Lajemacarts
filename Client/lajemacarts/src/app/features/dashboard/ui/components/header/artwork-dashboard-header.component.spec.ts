import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {By} from '@angular/platform-browser';
import {PageHeaderComponent} from './artwork-dashboard-header.component';

describe('ArtworksHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  const renderComponent = (): void => {
    fixture = TestBed.createComponent(PageHeaderComponent);
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
        PageHeaderComponent,
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
