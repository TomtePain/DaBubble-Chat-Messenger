import { Component } from '@angular/core';
import { Auth, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

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
    password: new FormControl('', [Validators.required]),
    acceptTerms: new FormControl('', [Validators.required, Validators.requiredTrue])
  })
  fullName: any = 'Test Name';
  profileImage = './assets/images/profile-icons/person.png';

  constructor(public fb: FormBuilder, public auth: Auth, private firestore: Firestore, private userAuth: AuthService, private storage: Storage) { }

  chooseProfile() {
    this.showChooseProfile = !this.showChooseProfile;
    this.fullName = this.regForm.value.fullName;
  }

  setProfileImage(path: any) {
    this.profileImage = path;
  }

  triggerInput() {
    document.getElementById('getFile')?.click();
  }

  regUser() {
    this.userAuth.regUser(this.regForm, this.profileImage, [], false);
  }
  upload(event: any) {
    const storageRef = ref(this.storage, '/upload/userIcons/' + event.target.files[0].name);
    const uploadTask = from(uploadBytes(storageRef, event.target.files[0]));
    uploadTask.subscribe(() => {
      getDownloadURL(storageRef).then(resp =>
        this.setProfileImage(resp)
      )

    })

  }
}
