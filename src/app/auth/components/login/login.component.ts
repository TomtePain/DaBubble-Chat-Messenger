import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/main/services/auth.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

const fadeOut = trigger('fadeOut', [
  state(
    'open',
    style({
      opacity: 1,
      transform: 'translate3d(0, 0, 1px)',
    })
  ),
  state(
    'close',
    style({
      opacity: 0,
      display: 'none',
    })
  ),
  transition('open => *', [animate('0.5s ease-out')]),
]);

const setLogoAnimation = trigger('setLogoAnimation', [
  state(
    'open',
    style({
      transform: 'translate(0px, 200px)',
    })
  ),
  state(
    'closed',
    style({
      transform: 'translate(0px, 0px)',
    })
  ),
  transition('open => closed', [animate('225ms')]),
]);

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeOut, setLogoAnimation],
})

export class LoginComponent implements OnInit {
  isShown: boolean = true;
  isBtnDisabled: boolean = false;
  private btnDisabledSubscription: Subscription = new Subscription();
  submit = false;
  loginForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  
  constructor(
    public fb: FormBuilder,
    private router: Router,
    public authservice: AuthService
  ) {}

  ngOnInit() {
    this.isShown = this.authservice.isShown;
    this.btnDisabledSubscription =
      this.authservice.btnDisabledObservable$.subscribe((value) => {
        this.isBtnDisabled = value;
      });
  }

  ngOnDestroy() {
    this.btnDisabledSubscription.unsubscribe();
  }

  login() {
    this.submit = true;
    const { email, password } = this.loginForm.value;
    if (!this.loginForm.valid || !email || !password) {
      return;
    }
    this.authservice.signIn(email, password);
  }

  googleWithAuth() {
    this.authservice.googleWithAuth();
  }

  guestLogin() {
    let email = 'guest.guestmail@existiert.net';
    let password = 'guest.guestmail@existiert.net';
    this.authservice.signIn(email, password);
  }

  enterSubmit($event: any) {
    if ($event.key == 'Enter') {
      this.login();
    }
  }

  startAnimation() {
    const currentPath = this.router.url;
    if (currentPath != '/auth/login') {
      this.authservice.isShown = false;
    } else {
      setTimeout(() => {
        this.isShown = false;
      }, 500);
    }
  }
}
