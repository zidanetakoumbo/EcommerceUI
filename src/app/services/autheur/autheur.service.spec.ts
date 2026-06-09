import { TestBed } from '@angular/core/testing';

import { AutheurService } from './autheur.service';

describe('AutheurService', () => {
  let service: AutheurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutheurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
