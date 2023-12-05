import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { UserService } from 'src/app/main/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  showChooseProfile: boolean = false;
  regForm = this.fb.group({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    acceptTerms: new FormControl('', [Validators.required, Validators.requiredTrue])
  })
  fullName: any = 'Test Name';
  profileImage = './assets/images/profile-icons/person.png';
  users: any;

  constructor(public fb: FormBuilder, public auth: Auth, private route: Router, private firestore: Firestore, private userAuth: AuthService, private storage: Storage, public user:UserService, private alertService: AlertService, private userservice: UserService) {
  }

  chooseProfile() {
    this.showChooseProfile = !this.showChooseProfile;
    this.fullName = this.regForm.value.fullName;
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
      this.showChooseProfile = !this.showChooseProfile;
      this.fullName = this.regForm.value.fullName;
    }, 4000);

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
