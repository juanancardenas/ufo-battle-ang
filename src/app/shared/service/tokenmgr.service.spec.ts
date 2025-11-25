import { TestBed } from '@angular/core/testing';

import { TokenmgrService } from './tokenmgr.service';

describe('TokenmgrService', () => {
  let service: TokenmgrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenmgrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
