import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLeaveChannelComponent } from './dialog-leave-channel.component';

describe('DialogLeaveChannelComponent', () => {
  let component: DialogLeaveChannelComponent;
  let fixture: ComponentFixture<DialogLeaveChannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogLeaveChannelComponent]
    });
    fixture = TestBed.createComponent(DialogLeaveChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
