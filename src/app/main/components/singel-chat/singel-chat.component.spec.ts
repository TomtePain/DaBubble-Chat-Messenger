import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingelChatComponent } from './singel-chat.component';

describe('SingelChatComponent', () => {
  let component: SingelChatComponent;
  let fixture: ComponentFixture<SingelChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingelChatComponent]
    });
    fixture = TestBed.createComponent(SingelChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
