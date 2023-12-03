import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { UserService } from 'src/app/main/services/user.service';
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
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    acceptTerms: new FormControl('', [Validators.required, Validators.requiredTrue])
  })
  fullName: any = 'Test Name';
  profileImage = './assets/images/profile-icons/person.png';
  users: any;

  constructor(public fb: FormBuilder, public auth: Auth, private firestore: Firestore, private userAuth: AuthService, private storage: Storage, public user:UserService) {
  }
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
