import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  submit = false;
  loginForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })
  constructor(public fb: FormBuilder, private userAuth: AuthService) {

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
    this.userAuth.signInGuest()
  }

  enterSubmit($event: any){
    if ($event.key == 'Enter') {
      this.login();
    }
  }
}
