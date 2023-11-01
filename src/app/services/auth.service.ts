import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, docData, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../auth/components/alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedUserId:string = '';  
  constructor(public auth: Auth, private firestore: Firestore, private route: Router, private alertService:AlertService) { }

  regUser(regFormValue: any, photoURL: string, accessToChannel: any, isOnline: boolean) {
    const { email, password, fullName } = regFormValue.value;
    if (!regFormValue.valid || !password || !email || !fullName) {
      return;
    }
    createUserWithEmailAndPassword(this.auth, email, password).then(resp => {
      const userId = resp.user.uid;
      const itemCollection = collection(this.firestore, environment.userDb);
      sendEmailVerification(resp.user);
      setDoc(doc(itemCollection), { uid: userId, fullName: fullName, photoURL: photoURL, accessToChannel: [], isOnline: false, email:email });
      this.alert('Konto erfolgreich erstellt!');
      this.route.navigateByUrl('auth/login');
    }).catch(err => {
      this.alert(err.code);
    })
  }

  sendPasswortResetMail(email: string) {
    sendPasswordResetEmail(this.auth, email).then(resp => {
      this.alert('E-Mail gesendet');

    })
  }
  googleWithAuth() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then(async resp => {
      const userId = resp.user.uid;
      const userPhotoURL = resp.user.photoURL;
      const fullName = resp.user.displayName;
      const email = resp.user.email;
      const itemCollection = collection(this.firestore, environment.userDb);
      let userIsReg = await this.isRegUser(userId);
      
      if (userIsReg.length > 0) {
        setDoc(doc(itemCollection, userIsReg), { uid: userId, fullName: fullName, photoURL: userPhotoURL, accessToChannel: [], isOnline: false, email: email });        
      }else {
        setDoc(doc(itemCollection), { uid: userId, fullName: fullName, photoURL: userPhotoURL, accessToChannel: [], isOnline: false, email: email }); 
      }
      this.setUserDataToLocalStorage(userId)
      setTimeout(() => {this.route.navigateByUrl('');},200) 
    });

  }
  signIn(email: string, password: string) {
    
    signInWithEmailAndPassword(this.auth, email, password).then(resp => {
      this.setUserDataToLocalStorage(resp.user.uid)
      if (resp.user.emailVerified) {
        setTimeout(() => {this.route.navigateByUrl('');},900)
      } else {
        this.alert('Verifiziere Ihre E-Mail-Adresse!')
      }
    }).catch(err => {
      let code = err.code;
      code = code.slice(5);
      this.alert(code);
      
    })
  }
  signInGuest() {
    signInAnonymously(this.auth).then(resp => {
      const userId: string = resp.user.uid
      const itemCollection = collection(this.firestore, environment.userDb);
      setDoc(doc(itemCollection), { uid: userId, fullName: 'Guest', photoURL: './assets/images/profile-icons/big/avatar-1.png', accessToChannel: [], isOnline: false });
      this.setUserDataToLocalStorage(userId)
      setTimeout(() => {this.route.navigateByUrl('');},900)
    });
  }

  logOut() {
    signOut(this.auth);
    this.route.navigateByUrl('auth/login');
  }

  setUserDataToLocalStorage(uid: string) {
    const itemCollection = collection(this.firestore, environment.userDb);
    const q = query(itemCollection, where('uid', '==', uid))
    getDocs(q).then((doc) => {
      if (doc.docs.length > 1) {
        //TODO: Error | More than 1 found
      } else if (doc.docs.length == 0) {
        //TODO: Error | less than 1 found
      } else {
        let userDbId = doc.docs[0].id;
        this.loggedUserId = userDbId;
        localStorage.setItem('userId', userDbId);
      }
    })
  }

  getUserData(userDbId: string) {
    const itemDoc = doc(this.firestore, environment.userDb + '/' + userDbId);
    return docData(itemDoc)
  }

  alert(text:string) {
    this.alertService.setAlert(text, true);
  }

  async isRegUser(userId:string):Promise<string> {
    const itemCollection = collection(this.firestore, environment.userDb);
    const q = query(itemCollection, where('uid', '==', userId));
    let isReg = '';
    await getDocs(q).then((doc) => {      
      if (doc.docs.length == 1) {
        isReg = doc.docs[0].id        
      }
    })
    return isReg
  }
}
