import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkTableComponent } from './artwork-table.component';

describe('ArtworkTableComponent', () => {
  let component: ArtworkTableComponent;
  let fixture: ComponentFixture<ArtworkTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtworkTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
