import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, docData, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userDBId= localStorage.getItem('userId');//: string = '';
  documentRef;


  constructor(public auth: Auth, private firestore: Firestore, private route: Router, private authService:AuthService) {    
    //this.userDBId = this.authService.loggedUserId;
    this.documentRef =  doc(this.firestore, environment.userDb + `/` + this.userDBId);
    
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
