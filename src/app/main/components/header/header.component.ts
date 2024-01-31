import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../../dialogs/profile/profile.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('profileMenuTrigger') profileMenuTrigger: MatMenuTrigger | undefined;
  fullName: string = '';
  userProfileImage: string = '';

  constructor(public dialog: MatDialog, private userservice: UserService, public auth: Auth, private firestore: Firestore, private refreshService: RefreshService) {}


  ngOnInit(): void {
    this.refreshService.refreshObservable.subscribe(() => {
      this.refreshData();
    });

    this.waitForLoginUser();
    
  }

  // Check every 225ms if the loginUser is now defined within the userService
  waitForLoginUser() {
    const interval = setInterval(() => {
      if (this.userservice.loginUser !== undefined) {
        this.setUserData();
        clearInterval(interval); // Stop repeating the interval once the loginUser is defined
      }
    }, 225);
  }

  ngOnDestroy() {
    this.fullName = '';
    this.userProfileImage = '';
  }

  refreshData() {
    this.setUserData();
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
