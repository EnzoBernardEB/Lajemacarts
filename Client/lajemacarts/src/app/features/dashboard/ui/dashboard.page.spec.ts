import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardPage} from './dashboard.page';

describe('DashboardPageComponent', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            url: of([]),
            params: of({}),
            queryParams: of({}),
            fragment: of(''),
            data: of({}),
          },
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
