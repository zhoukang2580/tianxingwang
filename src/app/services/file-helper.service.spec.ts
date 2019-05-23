import { TestBed } from '@angular/core/testing';

import { FileHelperService } from './file-helper.service';

describe('FileHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileHelperService = TestBed.get(FileHelperService);
    expect(service).toBeTruthy();
  });
});
