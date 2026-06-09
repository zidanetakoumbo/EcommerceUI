import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreFilterComponent } from './livre-filter.component';

describe('LivreFilterComponent', () => {
  let component: LivreFilterComponent;
  let fixture: ComponentFixture<LivreFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
