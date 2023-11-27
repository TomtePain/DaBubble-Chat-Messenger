import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { environment } from 'src/environments/environment';
import { getStorage, ref, deleteObject } from '@angular/fire/storage';



@Component({
  selector: 'app-dialog-delete-message',
  templateUrl: './dialog-delete-message.component.html',
  styleUrls: ['./dialog-delete-message.component.scss', '../chat-message.component.scss']
})
export class DialogDeleteMessageComponent implements OnInit {

  messageData;
  existingUser;
  channelId;

  storage = getStorage();
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogDeleteMessageComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService,) 
    {
      this.messageData = data.messageData;
      this.existingUser = data.existingUser;
      this.channelId = data.channelID;
    }


  ngOnInit(): void {
    this.checkForPDF();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  deleteMessage() {
    this.crud.deleteItem(environment.channelDb + '/' + this.channelId + '/' + 'messages' + '/' + this.messageData.id)
    .then(() => {
      this.deleteUploadedFile();
      this.closeDialog();
    });
  }


  deleteUploadedFile() {
    const spaceRef = ref(this.storage, 'upload/test/' + this.messageData.uploadFileName);

    deleteObject(spaceRef).then(() => {
      console.log('File deleted successfully')
    }).catch((error) => {
      console.log('// Uh-oh, an error occurred!', error)
    });
  }

  checkForPDF() {
    let name:string = this.messageData.uploadFileName;
    let splitedName: string[] = name.split('.');
    let lastPc: string = splitedName[splitedName.length - 1];
    return lastPc
  }

}
