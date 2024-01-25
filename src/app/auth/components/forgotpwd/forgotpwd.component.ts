import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/main/services/auth.service';

@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.scss']
})
export class ForgotpwdComponent implements OnInit{
  forgotpwdForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

  constructor(public fb: FormBuilder, private userAuth:AuthService) { }

  ngOnInit(): void {
    this.userAuth.isShown = false;
  }

  sendMail(){
    const {email} = this.forgotpwdForm.value
    if(!email) {
      return;
    }
    this.userAuth.sendPasswortResetMail(email);
  }
}
