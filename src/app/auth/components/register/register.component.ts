import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { UserService } from 'src/app/main/services/user.service';
import { AuthService } from 'src/app/main/services/auth.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  showChooseProfile: boolean = false;
  regEmailError: boolean = false;
  errorEmail: string = 'example@example.com'
  regForm = this.fb.group({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email, this.forbiddenEmailValidatorFactory()]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    acceptTerms: new FormControl('', [Validators.required, Validators.requiredTrue])
  })
  fullName: string = '';
  profileImage = './assets/images/profile-icons/person.png';
  users: any;



  constructor(public fb: FormBuilder, public auth: Auth, private route: Router, private firestore: Firestore, private userAuth: AuthService, private storage: Storage, public user:UserService, private alertService: AlertService, private userservice: UserService) {
  }

  chooseProfile() {
    this.showChooseProfile = !this.showChooseProfile;
    this.fullName = this.regForm.value.fullName as string;
  }

  finalizeRegistration() {
      this.alert('Verifiziere Deine Email-Adresse und logge Dich danach ein.');
      setTimeout(() => {
        this.route.navigateByUrl('auth/login');
      }, 4000);
  }

  setProfileImageAndFinalizeRegistration() {
    this.saveProfileImageChange();
    setTimeout(() => {
      this.finalizeRegistration();
    }, 250);
  }

  alert(text: string) {
    this.alertService.setAlert(text, true);
  }

  setProfileImage(path: any) {
    this.profileImage = path;
  }

  saveProfileImageChange() {
    this.userservice.saveUserImageOnRegistration(this.profileImage);
  }

  triggerInput() {
    document.getElementById('getFile')?.click();
  }

  regUser() {
    this.userAuth.regUser(this.regForm, this.profileImage, [], false);
    setTimeout(() => {
      if (this.userAuth.error) {    
        // save the already existing email address to an variable to use it as a validator in the registration form
        this.errorEmail = this.regForm.value.email as string;
          // Now trigger validation for the email field
        this.regForm.controls['email'].updateValueAndValidity();
    } else {
      //go to avatar selection      
          this.showChooseProfile = !this.showChooseProfile;
          this.fullName = this.regForm.value.fullName as string;}
    }, 4000);
  }

  forbiddenEmailValidatorFactory(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const isForbidden = control.value === this.errorEmail;
      return isForbidden ? { 'forbiddenEmail': {value: control.value} } : null;
    };
  }

  upload(event: any) {
    const storageRef = ref(this.storage, `/upload/${this.userservice.userDBId}/userIcons/` + event.target.files[0].name);
    const uploadTask = from(uploadBytes(storageRef, event.target.files[0]));
    uploadTask.subscribe(() => {
      getDownloadURL(storageRef).then(resp =>
        this.setProfileImage(resp)
      )
    })
  }
}
