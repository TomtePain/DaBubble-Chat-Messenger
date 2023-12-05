import { group } from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { matchpassword } from './matchpassword.validator';

@Component({
  selector: 'app-setnewpasswd',
  templateUrl: './setnewpasswd.component.html',
  styleUrls: ['./setnewpasswd.component.scss']
})
export class SetnewpasswdComponent {
  
  restpwdForm : FormGroup;

  

  constructor(private fb: FormBuilder) { 
    this.restpwdForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl(''),
    }, {validators:matchpassword})
  }

  resetPassword(){
    //TODO update password in firebase
    console.log("Passwort geändert");
    
  }
}
