import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelEditComponent } from './dialog-channel-edit.component';

describe('DialogChannelEditComponent', () => {
  let component: DialogChannelEditComponent;
  let fixture: ComponentFixture<DialogChannelEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogChannelEditComponent]
    });
    fixture = TestBed.createComponent(DialogChannelEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
