import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { DocumentReference, Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userDBId = localStorage.getItem('userId');
  documentRef!: DocumentReference;
  allUsers: any;
  allChannels: any;
  alluserRef:any;
  loginUser:any;

  constructor(public auth: Auth, private firestore: Firestore, private route: Router, private crud:CrudService) {
    this.setDocumentRef();
    this.getAllUsers();
    this.saveLoginUserData();
  }

  setDocumentRef() {
    this.documentRef = doc(this.firestore, environment.userDb + `/` + this.userDBId);
  }

  resetLoginUser() {
    this.userDBId = localStorage.getItem('userId');
    this.setDocumentRef();
    this.saveLoginUserData();
  }

  getAllUsers() {
    this.crud.getItem(environment.userDb).subscribe((resp) => {
      this.allUsers = resp;
    })
  }

  getAllChannels() {
    this.crud.getItem(environment.channelDb).subscribe((resp) => {
      this.allChannels = resp;
      return resp;
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

  updateUserData(fullName: string, email: string, searchTerms: string[]) {
    updateDoc(this.documentRef, {
      fullName: fullName,
      email: email,
      searchTerms: searchTerms
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