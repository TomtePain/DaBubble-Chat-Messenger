import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.scss']
})
export class ForgotpwdComponent {
  forgotpwdForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

  constructor(public fb: FormBuilder, private userAuth:AuthService) { }

  sendMail(){
    const {email} = this.forgotpwdForm.value
    if(!email) {
      return;
    }
    this.userAuth.sendPasswortResetMail(email);
  }
}
