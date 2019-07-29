import { TestBed } from '@angular/core/testing';

import { TrainService } from './train.service';

describe('TrainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrainService = TestBed.get(TrainService);
    expect(service).toBeTruthy();
  });
});
