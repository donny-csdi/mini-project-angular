import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RealtimeDatabaseService } from './realtime-database.service';
import { environment } from '../../environments/environment';

describe('RealtimeDatabaseService', () => {
  let service: RealtimeDatabaseService;
  let httpMock: HttpTestingController;
  const databaseUrl = `${environment.firebase.databaseURL}/formSubmissions`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RealtimeDatabaseService]
    });

    service = TestBed.inject(RealtimeDatabaseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save form submission', (done) => {
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john.doe@example.com',
      address: 'Pallet Town',
      pokemonToBuy: ['Pikachu', 'Charizard']
    };

    service.saveFormSubmission(mockData).then(() => {
      expect().nothing();
      done();
    });

    const req = httpMock.expectOne(`${databaseUrl}.json`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush({});
  });

  it('should get all form submissions', (done) => {
    const mockResponse = {
      '-id1': {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john.doe@example.com',
        address: 'Pallet Town',
        pokemonToBuy: ['Pikachu']
      },
      '-id2': {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        email: 'jane.smith@example.com',
        address: 'Viridian City',
        pokemonToBuy: ['Charizard', 'Blastoise']
      }
    };

    service.getFormSubmissions().then((result) => {
      expect(result).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${databaseUrl}.json`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update form submission', (done) => {
    const submissionId = '-id1';
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john.updated@example.com',
      address: 'Pallet Town',
      pokemonToBuy: ['Pikachu', 'Raichu']
    };

    service.updateFormSubmission(submissionId, mockData).then(() => {
      expect().nothing();
      done();
    });

    const req = httpMock.expectOne(`${databaseUrl}/${submissionId}.json`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockData);
    req.flush({});
  });

  it('should delete form submission', (done) => {
    const submissionId = '-id1';

    service.deleteFormSubmission(submissionId).then(() => {
      expect().nothing();
      done();
    });

    const req = httpMock.expectOne(`${databaseUrl}/${submissionId}.json`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
