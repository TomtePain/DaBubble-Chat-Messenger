import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspceComponent } from './workspce.component';

describe('WorkspceComponent', () => {
  let component: WorkspceComponent;
  let fixture: ComponentFixture<WorkspceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspceComponent]
    });
    fixture = TestBed.createComponent(WorkspceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
