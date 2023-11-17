import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, docData, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userDBId = localStorage.getItem('userId');//: string = '';
  documentRef;
  allUsers: any;
  alluserRef:any;
  loginUser:any;

  constructor(public auth: Auth, private firestore: Firestore, private route: Router, private authService: AuthService, private crud:CrudService) {
    //this.userDBId = this.authService.loggedUserId;
    this.documentRef = doc(this.firestore, environment.userDb + `/` + this.userDBId);
    // this.alluserRef = doc(this.firestore, environment.userDb);
    this.getAllUsers();
    this.saveLoginUserData();
  }

  getAllUsers() {
    this.crud.getItem(environment.userDb).subscribe((resp) => {
      this.allUsers = resp;
      // console.info('All Users,',resp);
    })
  }

  saveLoginUserData() {
    this.getUserData().subscribe(resp => {
      this.loginUser = resp;
      // console.log('saveLoginUserData',resp);
      
    })
  }

  getUserData(): Observable<any> {
    return docData(this.documentRef);
  }

  saveUserData(fullName: string, email: string) {
    updateDoc(this.documentRef, {
      fullName: fullName,
      email: email
    })
  }

  logOut() {
    localStorage.removeItem('userId');
    signOut(this.auth);
    this.route.navigateByUrl('auth/login');
  }
}
 