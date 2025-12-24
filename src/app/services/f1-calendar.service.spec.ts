import { TestBed } from '@angular/core/testing';

import { F1CalendarService } from './f1-calendar.service';

describe('F1CalendarService', () => {
  let service: F1CalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(F1CalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
