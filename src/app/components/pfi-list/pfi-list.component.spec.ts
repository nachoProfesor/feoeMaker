import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfiListComponent } from './pfi-list.component';

describe('PfiListComponent', () => {
  let component: PfiListComponent;
  let fixture: ComponentFixture<PfiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PfiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PfiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
