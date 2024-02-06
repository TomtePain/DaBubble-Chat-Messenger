import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceMainComponent } from './workspace-main.component';

describe('WorkspaceMainComponent', () => {
  let component: WorkspaceMainComponent;
  let fixture: ComponentFixture<WorkspaceMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspaceMainComponent]
    });
    fixture = TestBed.createComponent(WorkspaceMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
