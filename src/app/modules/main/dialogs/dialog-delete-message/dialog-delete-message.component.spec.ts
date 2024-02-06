import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteMessageComponent } from './dialog-delete-message.component';

describe('DialogDeleteMessageComponent', () => {
  let component: DialogDeleteMessageComponent;
  let fixture: ComponentFixture<DialogDeleteMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogDeleteMessageComponent]
    });
    fixture = TestBed.createComponent(DialogDeleteMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
