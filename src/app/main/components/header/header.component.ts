import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../../dialogs/profile/profile.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('profileMenuTrigger') profileMenuTrigger: MatMenuTrigger | undefined;
  fullName: string = '';
  userProfileImage: string = '';
  subscribtion$: Subscription;
  constructor(public dialog: MatDialog, private userService: UserService, public auth: Auth, private firestore: Firestore) {
    this.subscribtion$ = this.userService.getUserData().subscribe(resp =>{});
    this.fullName = '';
    this.userProfileImage = '';
  }


  ngOnInit(): void {
    this.setUserData();
  }

  ngOnDestroy() {
    this.subscribtion$.unsubscribe();
    this.fullName = '';
    this.userProfileImage = '';    
  }

  openDialog() {
    this.dialog.open(ProfileComponent, {
      width: '400px',
      autoFocus: false,
    });
  }

  openMenu() {
    this.profileMenuTrigger?.openMenu();
  }

  logOutUser() {
    this.userService.logOut();
    window.location.reload();
  }

  setUserData() {
    this.subscribtion$ = this.userService.getUserData().subscribe((resp) => {
      let data:UserProfile = resp as UserProfile;
      this.fullName = data.fullName;
      this.userProfileImage = data.photoURL;      
    })
  }
}
