import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreDetailComponent } from './livre-detail.component';

describe('LivreDetailComponent', () => {
  let component: LivreDetailComponent;
  let fixture: ComponentFixture<LivreDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
