import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddLivreComponent } from './admin-add-livre.component';

describe('AdminAddLivreComponent', () => {
  let component: AdminAddLivreComponent;
  let fixture: ComponentFixture<AdminAddLivreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddLivreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddLivreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
