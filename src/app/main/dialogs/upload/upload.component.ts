import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface MsgText {
  header: string,
  body: string
}
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})



export class UploadComponent {
  text:MsgText = {
    header: '',
    body: ''
  }

  constructor(
    public dialogRef: MatDialogRef<UploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {typeOfMessage:string},
  ) {
    this.setText();
  }

  setText() {
    switch (this.data.typeOfMessage) {
      case 'channel exist':
        this.text.header = 'Channel existiert bereits';
        this.text.body = 'Der Channelname ist bereits vergeben, bitte wählen Sie einen anderen Namen für Ihren Channel aus.';
        break;

      case 'delete msg':
        this.text.header = 'Erfolgreich gelöscht';
        this.text.body = 'Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Nachricht erfolgreich von unserem Server gelöscht wurde';
        break;

      case 'delete data':
        this.text.header = 'Erfolgreich gelöscht';
        this.text.body = 'Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Datei erfolgreich von unserem Server gelöscht wurde';
        break

      case 'big data':
        this.text.header = 'Größenbeschränkung';
        this.text.body = 'Die maximale Größenbeschränkung für das Hochladen von Dateien auf unserer Plattform bei 500 KB liegt. Wenn Sie versuchen, eine Datei hochzuladen, die diese Beschränkung überschreitet, wird der Upload nicht erfolgreich sein.'
        
        break;
      case 'hochgeladen':
        this.text.header = 'Erfolgreich hochgeladen';
        this.text.body = 'Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Datei erfolgreich auf unserem Server geladen wurde';
        break;

      case 'wrong type':
        this.text.header = 'Nur das Senden von Bildern und PDFs';
        this.text.body = 'aus Sicherheitsgründen möchten wir darauf hinweisen, dass nur das Senden von Bildern und PDF-Dateien auf unserer Plattform möglich ist. Andere Dateiformate werden aus Sicherheitsüberlegungen nicht akzeptiert.'
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.dialogRef.close()
    }, 3000);
  }
}
