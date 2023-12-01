import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { from } from 'rxjs';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  profileEdit: boolean = false;
  userFullName:string = '';
  userEmail:string = '';
  userProfileImage:string = '';
  profileImageEdit: boolean = false;
  profileImage = './assets/images/profile-icons/person.png';

  profileForm = this.fb.group({
    fullNameFormControl: new FormControl('', [Validators.required]),
    emailFormControl: new FormControl('', [Validators.required, Validators.email]),

  });

  constructor(public dialog: MatDialog, private fb: FormBuilder, public dialogRef: MatDialogRef<ProfileComponent>, private userservice: UserService, private storage: Storage) {
    this.setData();
  }

  get f() { return this.profileForm.controls; }

  editProfile() {
    this.profileEdit = true;
  }
  cancelEditProfile() {
    this.profileEdit = false;
    this.profileImageEdit = false;
    this.setData();
  }

  chooseProfile() {
    this.profileImageEdit = !this.profileImageEdit;    
  }

  setProfileImage(path: any) {
    this.userProfileImage = path;
  }

  triggerInput() {
    document.getElementById('getFile')?.click();
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

  saveProfileImageChange() {
    this.userservice.saveUserImage(this.userProfileImage);
    setTimeout(() => {
      this.setData();
      this.profileImageEdit = false;
    }, 150);
  }

  cancelProfileImageChange() {
    this.profileImageEdit = false;
    this.userProfileImage = this.userservice.loginUser.photoURL; //reset profile image to last saved one
  }

  setData() {
      let userData: UserProfile = this.userservice.loginUser as UserProfile;
      this.userFullName = userData.fullName;
      this.userEmail = userData.email;
      this.userProfileImage = userData.photoURL;
      this.profileForm.controls.emailFormControl.setValue(userData.email);
      this.profileForm.controls.fullNameFormControl.setValue(userData.fullName);
  }
  

  saveUserData() {
    let formFullname = this.profileForm.controls.fullNameFormControl.value;
    let formEmail = this.profileForm.controls.emailFormControl.value;
    if (formFullname !== null && formEmail !== null) {
      this.userservice.saveUserData(formFullname, formEmail);
      setTimeout(() => {
        this.setData();
        this.profileEdit = false;
      }, 50);
  } else {
      console.warn('An error occurred', "fromFullname", formFullname,"fromEmail", formEmail);
      
  }
  }
  updateLocal() {
    let userData = JSON.parse(localStorage.getItem('activUser') || '{}');
    userData.fullName = 'TEste mich'
    localStorage.setItem('activUser',JSON.stringify(userData))
  }
}
