import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetnewpasswdComponent } from './setnewpasswd.component';

describe('SetnewpasswdComponent', () => {
  let component: SetnewpasswdComponent;
  let fixture: ComponentFixture<SetnewpasswdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetnewpasswdComponent]
    });
    fixture = TestBed.createComponent(SetnewpasswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
