import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileviewOfOthersComponent } from './dialog-profileview-of-others.component';

describe('DialogProfileviewOfOthersComponent', () => {
  let component: DialogProfileviewOfOthersComponent;
  let fixture: ComponentFixture<DialogProfileviewOfOthersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogProfileviewOfOthersComponent]
    });
    fixture = TestBed.createComponent(DialogProfileviewOfOthersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
