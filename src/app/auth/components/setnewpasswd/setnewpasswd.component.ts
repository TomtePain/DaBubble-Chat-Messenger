import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { matchpassword } from './matchpassword.validator';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/main/services/auth.service';

@Component({
  selector: 'app-setnewpasswd',
  templateUrl: './setnewpasswd.component.html',
  styleUrls: ['./setnewpasswd.component.scss'],
})
export class SetnewpasswdComponent {
  restpwdForm: FormGroup;
  // Get the action to complete.
  mode!: string;
  // Get the one-time code from the query parameter.
  actionCode!: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService
  ) {
    this.activatedRoute.queryParams
      .pipe(filter((params) => params['mode']))
      .subscribe((params) => {
        this.mode = params['mode'];
        this.actionCode = params['oobCode'];
        // console.log("mode",this.mode);
        // console.log("actionCode",this.actionCode);
        // console.log("API key", environment.firebase.apiKey);
      });

    this.restpwdForm = new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl(''),
      },
      { validators: matchpassword }
    );
  }

  ngOnInit() {
    if (this.mode === 'verifyEmail') {
      this.verifyEmail();
    }
    this.auth.isShown = false;
  }

  resetPassword() {
    const passwordControl = this.restpwdForm.get('password');
    if (passwordControl) {
      const newPassword = passwordControl.value;
      this.auth.handleResetPasswort(this.actionCode, newPassword);
    } else {
      console.error('Password control is not found in the form');
    }
  }

  verifyEmail() {
    this.auth.handleVerifyEmail(this.actionCode)
    console.log('Email wird verifiziert');
  }
}
