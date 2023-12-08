import { Injectable } from '@angular/core';
import { loggedIn } from '@angular/fire/auth-guard';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private showAlertSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showAlert$: Observable<boolean> = this.showAlertSubject.asObservable();
  alerText$: Observable<string> = this.alertTextSubject.asObservable();
  constructor() { }


  setAlert(text: string, showAlert:boolean) {
    console.log("this.alertTextSubject", this.alertTextSubject);
    
    this.alertTextSubject.next(text);
    this.showAlertSubject.next(showAlert);
  }

}
