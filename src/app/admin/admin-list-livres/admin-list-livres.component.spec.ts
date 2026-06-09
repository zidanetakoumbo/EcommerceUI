import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListLivresComponent } from './admin-list-livres.component';

describe('AdminListLivresComponent', () => {
  let component: AdminListLivresComponent;
  let fixture: ComponentFixture<AdminListLivresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListLivresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListLivresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
