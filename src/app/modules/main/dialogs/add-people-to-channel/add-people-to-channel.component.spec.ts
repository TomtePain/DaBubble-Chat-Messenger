import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPeopleToChannelComponent } from './add-people-to-channel.component';

describe('AddPeopleToChannelComponent', () => {
  let component: AddPeopleToChannelComponent;
  let fixture: ComponentFixture<AddPeopleToChannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPeopleToChannelComponent]
    });
    fixture = TestBed.createComponent(AddPeopleToChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
