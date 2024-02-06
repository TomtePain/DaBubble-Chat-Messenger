import { Component, Input } from '@angular/core';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  alertText:string = 'Tada';
  showAlert:boolean = false;
  constructor(private alertService:AlertService){
    this.alertService.alerText$.subscribe((text) => {
      if (text === "auth/email-already-in-use"){
        this.alertText = "Diese E-Mail-Adresse wird bereits verwendet. Bitte wähle eine andere Adresse"
      } else {
      this.alertText = text;
      }
    });
    this.alertService.showAlert$.subscribe((bool) => {
      this.showAlert = bool;
      setTimeout(() => {
        this.showAlert = false;
      },5000)
    })
  }

}
