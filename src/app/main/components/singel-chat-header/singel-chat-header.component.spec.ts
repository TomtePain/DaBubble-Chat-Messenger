import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingelChatHeaderComponent } from './singel-chat-header.component';

describe('SingelChatHeaderComponent', () => {
  let component: SingelChatHeaderComponent;
  let fixture: ComponentFixture<SingelChatHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingelChatHeaderComponent]
    });
    fixture = TestBed.createComponent(SingelChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
