import { group } from '@angular/animations';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { matchpassword } from './matchpassword.validator';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-setnewpasswd',
  templateUrl: './setnewpasswd.component.html',
  styleUrls: ['./setnewpasswd.component.scss'],
})
export class SetnewpasswdComponent {
  restpwdForm: FormGroup;
  isPwdReset: boolean = false;
  isEmailVerify: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams
      .pipe(filter((params) => params['mode']))
      .subscribe((params) => {
        if (params['mode'] === 'resetPassword') {
          this.isPwdReset = true;
          this.isEmailVerify = false;
        } else if (params['mode'] === 'verifyEmail') {
          this.isPwdReset = false;
          this.isEmailVerify = true;
        }
      });

    this.restpwdForm = new FormGroup(
      {
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl(''),
      },
      { validators: matchpassword }
    );
  }

  resetPassword() {
    //TODO update password in firebase
    console.log('Passwort geändert');
  }

  verifyEmail() {
    //TODO check if something needs to be done to verify email in firebase or if click on email is already doing the required signal.
    console.log('Email verifiziert');
  }
}
