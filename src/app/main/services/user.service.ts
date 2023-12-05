import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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

  constructor(public auth: Auth, private firestore: Firestore, private route: Router, private crud:CrudService) {
    this.documentRef = doc(this.firestore, environment.userDb + `/` + this.userDBId);
    this.getAllUsers();
    this.saveLoginUserData();
  }

  getAllUsers() {
    this.crud.getItem(environment.userDb).subscribe((resp) => {
      this.allUsers = resp;
    })
  }

  saveLoginUserData() {
    this.getUserData().subscribe(resp => {
      this.loginUser = resp;      
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

  saveUserImage(imagepath: string) {
    updateDoc(this.documentRef, {
      photoURL: imagepath,
    })
  }

  saveUserImageOnRegistration(imagepath: string) {
    this.userDBId = localStorage.getItem('userId')
    this.documentRef = doc(this.firestore, environment.userDb + `/` + this.userDBId)
    updateDoc(this.documentRef, {
      photoURL: imagepath,
    })
  }

  logOut() {
    localStorage.removeItem('userId');
    signOut(this.auth);
    this.route.navigateByUrl('auth/login');
  }
}
 