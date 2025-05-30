// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { SubmissionsComponent } from './submissions.component';
// // import { RealtimeDatabaseService } from '../../services/realtime-database.service';
// import { Router } from '@angular/router';

// describe('SubmissionsComponent', () => {
//   let component: SubmissionsComponent;
//   let fixture: ComponentFixture<SubmissionsComponent>;
//   // let mockRealtimeDbService: jasmine.SpyObj<RealtimeDatabaseService>;
//   let mockRouter: jasmine.SpyObj<Router>;

//   const mockSubmissions = {
//     'id1': {
//       name: 'Pikachu',
//       type: 'Electric',
//       level: 25,
//       email: 'trainer@pokemon.com',
//       phone: '1234567890',
//       address: 'Pallet Town'
//     },
//     'id2': {
//       name: 'Charizard',
//       type: 'Fire/Flying',
//       level: 36,
//       email: 'trainer2@pokemon.com',
//       phone: '0987654321',
//       address: 'Viridian City'
//     }
//   };

//   beforeEach(async () => {
//     mockRealtimeDbService = jasmine.createSpyObj('RealtimeDatabaseService', ['getFormSubmissions', 'deleteFormSubmission']);
//     mockRouter = jasmine.createSpyObj('Router', ['navigate']);

//     await TestBed.configureTestingModule({
//       declarations: [ SubmissionsComponent ],
//       providers: [
//         // { provide: RealtimeDatabaseService, useValue: mockRealtimeDbService },
//         { provide: Router, useValue: mockRouter }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(SubmissionsComponent);
//     component = fixture.componentInstance;
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should load submissions on init', fakeAsync(() => {
//     mockRealtimeDbService.getFormSubmissions.and.returnValue(Promise.resolve(mockSubmissions));
    
//     fixture.detectChanges();
//     tick();

//     expect(component.submissions.length).toBe(2);
//     expect(component.submissions[0]).toEqual({
//       id: 'id1',
//       ...mockSubmissions['id1']
//     });
//     expect(component.loading).toBeFalse();
//     expect(component.error).toBeNull();
//   }));

//   it('should navigate to edit page when editing a submission', () => {
//     const submissionId = 'id1';
//     component.editSubmission(submissionId);

//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/edit-submission', submissionId]);
//   });

//   it('should delete submission when confirmed', fakeAsync(() => {
//     spyOn(window, 'confirm').and.returnValue(true);
//     mockRealtimeDbService.deleteFormSubmission.and.returnValue(Promise.resolve());
    
//     component.submissions = [
//       { id: 'id1', ...mockSubmissions['id1'] },
//       { id: 'id2', ...mockSubmissions['id2'] }
//     ];

//     component.deleteSubmission('id1');
//     tick();

//     expect(component.submissions.length).toBe(1);
//     expect(component.submissions[0].id).toBe('id2');
//     expect(mockRealtimeDbService.deleteFormSubmission).toHaveBeenCalledWith('id1');
//   }));
// });
