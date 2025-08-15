import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent, NavMenuComponent, RouterOutlet],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the navigation menu', () => {
    const navMenu = fixture.debugElement.query(By.directive(NavMenuComponent));
    expect(navMenu).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).toBeTruthy();
  });
});
