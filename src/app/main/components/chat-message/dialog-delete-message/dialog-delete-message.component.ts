import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { environment } from 'src/environments/environment';
import { getStorage, ref, deleteObject } from '@angular/fire/storage';
import { UploadComponent } from 'src/app/main/dialogs/upload/upload.component';



@Component({
  selector: 'app-dialog-delete-message',
  templateUrl: './dialog-delete-message.component.html',
  styleUrls: ['./dialog-delete-message.component.scss', '../chat-message.component.scss']
})
export class DialogDeleteMessageComponent implements OnInit {

  messageData;
  existingUser;
  channelId;
  userDBId;
  threadId;
  messageType;

  storage = getStorage();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogDeleteMessageComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService,) {
    this.messageType = data.messageType;
    this.messageData = data.messageData;
    this.existingUser = data.existingUser;
    this.channelId = data.channelID;
    this.threadId = data.channelID;
    this.userDBId = data.userID;
  }


  ngOnInit(): void {
    this.checkForPDF();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  deleteMessage() {
    if (this.messageType = 'chat') {
      this.deleteChatMessage()
    } else if (this.messageType = 'thread') {
      this.deleteThreadMessage();
    } else {
      console.warn ("Message to delete is neither a chat message nor a thread message")
    }
  }

  deleteChatMessage() {
    this.crud.deleteItem(environment.channelDb + '/' + this.channelId + '/' + 'messages' + '/' + this.messageData.id)
      .then(() => {
        if (this.messageData.uploadFile) {
          this.deleteUploadedFile();
        } else {
          this.showUploadDialog('delete msg');
        }
        this.closeDialog();
      });
  }

  deleteThreadMessage() {
    this.crud.deleteItem(environment.threadDb + '/' + this.threadId + '/' + 'messages' + this.messageData.id)
    .then(() => {
      if (this.messageData.uploadFile) {
        this.deleteUploadedFile();
      } else {
        this.showUploadDialog('delete msg');
      }
      this.closeDialog();
    });
}


  deleteUploadedFile() {
    const spaceRef = ref(this.storage, `/upload/${this.userDBId}/` + this.messageData.uploadFileName);

    deleteObject(spaceRef).then(() => {
      this.showUploadDialog('delete data');
    }).catch((error) => {
      console.log('// Uh-oh, an error occurred!', error)
    });
  }

  checkForPDF() {
    let name: string = this.messageData.uploadFileName;
    let lastPc;
    if (name) {
      let splitedName: string[] = name.split('.');
      lastPc = splitedName[splitedName.length - 1];
      return lastPc
    } else {
      return
    }
  }

  showUploadDialog(msg: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: { typeOfMessage: msg },
    });
  }

}
