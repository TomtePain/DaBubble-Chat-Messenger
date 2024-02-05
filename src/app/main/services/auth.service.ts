import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  applyActionCode,
  getAuth,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from '@angular/fire/auth';
import {
  Firestore,
  arrayUnion,
  collection,
  doc,
  docData,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../../auth/components/alert/alert.service';
import { CrudService } from './crud.service';
import { TreeService } from './tree.service';
// import { getAuth, updateEmail } from 'firebase/auth';
import { UserService } from './user.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedUserId: string = '';
  error: boolean = false;
  isShown:boolean = true;
  private btnDisabledSubject: Subject<boolean> = new Subject<boolean>();
  btnDisabledObservable$: Observable<boolean> = this.btnDisabledSubject.asObservable();
  private _btnDisabled: boolean = false;

  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private route: Router,
    private alertService: AlertService,
    private crud: CrudService,
    private tree: TreeService,
    private userservice: UserService
  ) {
    console.log('')
  }

  regUser(
    regFormValue: any,
    photoURL: string,
    accessToChannel: any,
    isOnline: boolean
  ) {
    const { email, password, fullName } = regFormValue.value;
    if (!regFormValue.valid || !password || !email || !fullName) {
      return;
    }
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((resp) => {
        const userId = resp.user.uid;
        let userData = {
          uid: userId,
          fullName: fullName,
          searchTerms: this.generateSearchTerms(fullName as string, email as string),
          photoURL: photoURL,
          accessToChannel: [],
          isOnline: false,
          email: email,
          uploadFileCounter: 0
        };
        sendEmailVerification(resp.user);
        this.crud.addItem(userData, environment.userDb).then((docRef) => {
          this.upDateChannelUser(docRef);
          this.tree.createOwnDM(docRef);
        });
        this.alert(
          'Konto erfolgreich erstellt, bitte verifiziere Deine Email-Adresse.'
        );
        this.setUserDataToLocalStorage(userId);
        this.error = false;
      })
      .catch((err) => {
        this.alert(err.code);
        this.error = true;
      });
  }

  sendPasswortResetMail(email: string) {
    sendPasswordResetEmail(this.auth, email).then((resp) => {
      this.alert('E-Mail gesendet');
    });
  }

  googleWithAuth() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then(async (resp) => {
      const userId = resp.user.uid;
      const userPhotoURL = resp.user.photoURL;
      const fullName = resp.user.displayName;
      const email = resp.user.email;
      const itemCollection = collection(this.firestore, environment.userDb);
      let userIsReg = await this.isRegUser(userId);
      let userData = {
        uid: userId,
        fullName: fullName,
        searchTerms: this.generateSearchTerms(fullName as string, email as string),
        photoURL: userPhotoURL,
        accessToChannel: [],
        isOnline: true,
        email: email,
        uploadFileCounter: 0
      };

      if (userIsReg.length > 0) {
        // setDoc(doc(itemCollection, userIsReg), userData);
      } else {
        this.crud.addItem(userData, environment.userDb).then((docRef) => {
          this.upDateChannelUser(docRef);
          this.tree.createOwnDM(docRef);
        });
      }
      this.setUserDataToLocalStorage(userId);
      setTimeout(() => {
        this.route.navigateByUrl('');
      }, 200);
    });
  }

  upDateChannelUser(docRef: any) {
    let updateItem = doc(
      collection(this.firestore, environment.channelDb),
      environment.mainChannel
    );
    updateDoc(updateItem, {
      ids: arrayUnion(docRef.id),
    });
  }

  signIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((resp) => {
        this.setUserDataToLocalStorage(resp.user.uid);
        if (resp.user.emailVerified) {
          setTimeout(() => {
            this.route.navigateByUrl('');
          }, 900);
        } else {
          this.alert('Verifiziere Deine E-Mail-Adresse!');
        }
      })
      .catch((err) => {
        let code = err.code;
        code = code.slice(5);
        if (code === 'wrong-password') {
          this.alert('Das eingegebene Passwort ist falsch. Bitte versuche es erneut.');
        } else if (code === 'too-many-requests') {
          this.alert('Zugriff gesperrt, bitte versuche es später erneut.')
        } else {
        this.alert(code);}
      });
  }

  signInGuest() {
    signInAnonymously(this.auth).then((resp) => {
      const userId: string = resp.user.uid;
      const itemCollection = collection(this.firestore, environment.userDb);
      setDoc(doc(itemCollection), {
        uid: userId,
        fullName: 'Guest',
        photoURL: './assets/images/profile-icons/big/avatar-1.png',
        accessToChannel: [],
        isOnline: false,
      });
      this.setUserDataToLocalStorage(userId);
      setTimeout(() => {
        this.route.navigateByUrl('');
      }, 900);
    });
  }

  logOut() {
    signOut(this.auth);
    this.route.navigateByUrl('auth/login');
  }

  setUserDataToLocalStorage(uid: string) {
    const itemCollection = collection(this.firestore, environment.userDb);
    const q = query(itemCollection, where('uid', '==', uid));
    getDocs(q).then((doc) => {
      if (doc.docs.length > 1) {
        //TODO: Error | More than 1 found
      } else if (doc.docs.length == 0) {
        //TODO: Error | less than 1 found
      } else {
        let userDbId = doc.docs[0].id;
        this.loggedUserId = userDbId;
        localStorage.setItem('userId', userDbId);
        this.userservice.userDBId = userDbId;
      }
    });
  }

  getUserData(userDbId: string) {
    const itemDoc = doc(this.firestore, environment.userDb + '/' + userDbId);
    return docData(itemDoc);
  }

  alert(text: string) {
    this.alertService.setAlert(text, true);
  }

  async isRegUser(userId: string): Promise<string> {
    const itemCollection = collection(this.firestore, environment.userDb);
    const q = query(itemCollection, where('uid', '==', userId));
    let isReg = '';
    await getDocs(q).then((doc) => {
      if (doc.docs.length == 1) {
        isReg = doc.docs[0].id;
      }
    });
    return isReg;
  }

  handleReauthenticationAndChangeEmail(email: string, password: string, newEmail: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(email, password);
      reauthenticateWithCredential(user, credential).then(() => {
        // User re-authenticated, now update email
        this.handleEmailChange(newEmail); 
      }).catch((error) => {
        // Handle errors here, such as wrong password
        console.error('Re-authentication failed', error);
      });
    }
  }

  handleEmailChange(newEmail: string) {
    let previousUserEmail = this.auth.currentUser?.email;

    if (previousUserEmail != newEmail) {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
      
        updateEmail(user, newEmail).then(() => {
            // Email updated!
            // console.log("Email updated", newEmail, user);
            // Send email to verify email to new email address
            // sendEmailVerification(user).then(() => {
            // console.log("Email verification sent", user);
            // }); 
          })
          .catch((error) => {
            console.error("Error", error);
            
            // An error occurred
            let code = error.code;
            code = code.slice(5);
            this.alert(code);
          });
      } else {
        console.error('No user is currently signed in.');
      }
    } else {
      console.warn("Email adresses are not different", "previousUserEmail", previousUserEmail, "newEmail", newEmail);
      
    }
  }

  handleResetPasswort(actionCode: string, newPassword: string) {
    const auth = getAuth();
    confirmPasswordReset(auth, actionCode, newPassword)
      .then((resp) => {
        //Show alert for successful change and redirec to login page
        this.alert(
          'Passwort erfolgreich geändert. Du wirst zum Login weitergeleitet.'
        );
        setTimeout(() => {
          this.route.navigateByUrl('auth/login');
        }, 4000);
      })
      .catch((error) => {
        let code = error.code;
        code = code.slice(5);

        if (code === 'invalid-action-code') {
          this.alert(
            'Dein Link ist abgelaufen. Frage einen neuen Link über "Passwort vergessen" an'
          );
          setTimeout(() => {
            this.route.navigateByUrl('auth/forgotpassword');
          }, 4000);
        } else {
          this.alert('code');
        }
      });
  }

  handleVerifyEmail(actionCode: string) {
    // Try to apply the email verification code.
    const auth = getAuth();
    applyActionCode(auth, actionCode).then((resp) => {
      // Email address has been verified.
      this.alert(
        'Email erfolgreich verifiziert. Du wirst zum Login weitergeleitet.'
      );
      setTimeout(() => {
        this.route.navigateByUrl('auth/login');
      }, 4000);
    // })
    }).catch((error) => {
      let code = error.code;
      code = code.slice(5);
      console.error("code", code);
      setTimeout(() => {
        this.alert('Es ist ein Fehler bei der Verifizierung aufgetreten. Bitte wende Dich an den Administrator.');
      }, 2500);


      // if (code === 'invalid-action-code') {
      //   this.alert(
      //     'Dein Link ist abgelaufen. Frage einen neuen Link über "Passwort vergessen" an'
      //   );
      //   setTimeout(() => {
      //     this.route.navigateByUrl('auth/forgotpassword');
      //   }, 4000);
      // } else {
    //     this.alert('code');
    //   }
    });
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

  get btndisabled(): boolean {
    return this._btnDisabled;
  }
  
  set btndisabled(value: boolean) {
    this._btnDisabled = value;
    this.btnDisabledSubject.next(value); // Emit the updated value
  }
}