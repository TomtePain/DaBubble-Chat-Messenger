import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../../dialogs/profile/profile.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from 'src/app/interfaces/user-profile';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('profileMenuTrigger') profileMenuTrigger: MatMenuTrigger | undefined;
  fullName: string = '';
  userProfileImage: string = '';

  constructor(public dialog: MatDialog, private userservice: UserService, public auth: Auth, private firestore: Firestore) {
  }


  ngOnInit(): void {
    setTimeout(() => {
      console.log("this.userservice.loginUser", this.userservice.loginUser);
      if (this.userservice.loginUser === undefined) {
        console.log("reload");
        window.location.reload();
      } else {
        this.setUserData();
      }
    }, 500);
  }


  ngOnDestroy() {
    this.fullName = '';
    this.userProfileImage = '';    
  }

  openDialog() {
    this.dialog.open(ProfileComponent, {
      width: '500px',
      autoFocus: false,
    });
  }

  openMenu() {
    this.profileMenuTrigger?.openMenu();
  }

  logOutUser() {
    this.userservice.logOut();
    window.location.reload();
  }

  setUserData() {
    let data: UserProfile = this.userservice.loginUser as UserProfile;
    this.fullName = data.fullName;
    this.userProfileImage = data.photoURL;
  }
}
