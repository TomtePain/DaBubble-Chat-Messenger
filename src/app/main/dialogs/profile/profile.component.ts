import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { object } from '@angular/fire/database';



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

  profileForm = this.fb.group({
    fullNameFormControl: new FormControl('', [Validators.required]),
    emailFormControl: new FormControl('', [Validators.required, Validators.email]),

  });

  constructor(public dialog: MatDialog, private fb: FormBuilder, public dialogRef: MatDialogRef<ProfileComponent>, private userservice: UserService) {
    this.setData();
  }
  get f() { return this.profileForm.controls; }

  editProfile() {
    this.profileEdit = true;
  }
  cancelEditProfile() {
    this.dialogRef.close()
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
    let fromFullname = this.profileForm.controls.fullNameFormControl.value;
    let fromEmail = this.profileForm.controls.emailFormControl.value;
    if (fromFullname !== null && fromEmail !== null) {
      this.userservice.saveUserData(fromFullname, fromEmail);
      this.profileEdit = false;
  } else {
      // TODO: die Werte null
  }
  }
  updateLocal() {
    let userData = JSON.parse(localStorage.getItem('activUser') || '{}');
    userData.fullName = 'TEste mich'
    localStorage.setItem('activUser',JSON.stringify(userData))
  }
}
