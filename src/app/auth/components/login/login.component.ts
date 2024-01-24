import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/main/services/auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';

const fadeOut = trigger('fadeOut', [
  state(
    'open',
    style({
      opacity: 1,
      transform: 'translate3d(0, 0, 1px)'
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
  state('open', style({
    transform: 'translate(0px, 200px)',
  })),
  state('closed', style({
    transform: 'translate(0px, 0px)',
  })),
  transition('open => closed', [
    animate('225ms')
  ]),
])


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeOut, setLogoAnimation]
})
export class LoginComponent implements OnInit {

  isShown: boolean = true;

  submit = false;
  loginForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })
  constructor(public fb: FormBuilder, private userAuth: AuthService, private router: Router) {

  }

  ngOnInit() {
  }

  login() {
    this.submit = true;
    const { email, password } = this.loginForm.value
    if (!this.loginForm.valid || !email || !password) {
      return;
    }
    this.userAuth.signIn(email, password);
  }

  googleWithAuth() {
    this.userAuth.googleWithAuth();
  }

  guestLogin() {
    // this.userAuth.signInGuest()
    let email = 'guest.guestmail@existiert.net';
    let password = 'guest.guestmail@existiert.net';
    this.userAuth.signIn(email, password);
  }

  enterSubmit($event: any){
    if ($event.key == 'Enter') {
      this.login();
    }
  }

  startAnimation() {
    const currentPath = this.router.url;
    if (currentPath == '/auth/login') {
      this.isShown = false;
    } else {
      setTimeout(() => {
        this.isShown = false;
      }, 500)
    }
  }
}
