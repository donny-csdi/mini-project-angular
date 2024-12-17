import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonFormSubmissionComponent } from './pokemon-form-submission.component';

describe('PokemonFormSubmissionComponent', () => {
  let component: PokemonFormSubmissionComponent;
  let fixture: ComponentFixture<PokemonFormSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonFormSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFormSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
