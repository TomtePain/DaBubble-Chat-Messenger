import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { from } from 'rxjs';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { AuthService } from 'src/app/main/services/auth.service';
import { RefreshService } from '../../services/refresh.service';
import { environment } from 'src/environments/environment';

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
  currentUserIsGuest:boolean = false;

  profileForm = this.fb.group({
    fullNameFormControl: new FormControl('', [Validators.required]),
    guestNameFormControl: new FormControl({value: 'Gast', disabled: true}),
    // emailFormControl: new FormControl('', [Validators.required, Validators.email]) //Activate to enable email change option
    emailFormControl: new FormControl({value: '', disabled: true}) //Activate to disable email change option

  });

  constructor(public dialog: MatDialog, private fb: FormBuilder, public dialogRef: MatDialogRef<ProfileComponent>, private userservice: UserService, private storage: Storage, private authservice: AuthService, private refreshService:RefreshService) {
    this.setData();
    this.checkIsGuest();
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
    const storageRef = ref(this.storage, `/upload/${this.userservice.userDBId}/userIcons/` + event.target.files[0].name);
    console.log("event.target.files[0].name", event.target.files[0].name);
    
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
  
  checkIsGuest() {
    if(this.userservice.userDBId == environment.guest) {
      this.currentUserIsGuest = true;
    }else {
      this.currentUserIsGuest = false;
    }
  }

  updateUserData() {
    let formFullname = this.profileForm.controls.fullNameFormControl.value;
    let formEmail = this.profileForm.controls.emailFormControl.value as string;
    let searchTerms = this.generateSearchTerms(formFullname as string, formEmail as string);
    if (formFullname !== null && formEmail !== null) {
      this.userservice.updateUserData(formFullname, formEmail, searchTerms);
      // this.authservice.handleEmailChange(formEmail);
      // console.log("Data sent to authservice", formEmail);
      
      setTimeout(() => {
        this.setData();
        this.profileEdit = false;
        this.refreshService.triggerRefresh();
      }, 250);
  } else {
      console.warn('An error occurred', "formFullname", formFullname,"formEmail", formEmail);  
  }
  }

  updateLocal() {
    let userData = JSON.parse(localStorage.getItem('activUser') || '{}');
    userData.fullName = 'TEste mich'
    localStorage.setItem('activUser',JSON.stringify(userData))
  }

  generateSearchTerms(fullName: string, email: string) {
    const nameLowerCase = fullName.toLowerCase();

    // Split the lowercase sentence into words based on spaces
    const regex = /\s+/;
    let array = nameLowerCase.split(regex).filter(word => word.length > 0);
  
    // Add the entire lowercase sentence as a separate element
    array.push(nameLowerCase);
    array.push(email)
    
    return array;
  }
}
