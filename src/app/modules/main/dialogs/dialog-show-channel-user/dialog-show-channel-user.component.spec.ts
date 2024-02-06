import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowChannelUserComponent } from './dialog-show-channel-user.component';

describe('DialogShowChannelUserComponent', () => {
  let component: DialogShowChannelUserComponent;
  let fixture: ComponentFixture<DialogShowChannelUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogShowChannelUserComponent]
    });
    fixture = TestBed.createComponent(DialogShowChannelUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
