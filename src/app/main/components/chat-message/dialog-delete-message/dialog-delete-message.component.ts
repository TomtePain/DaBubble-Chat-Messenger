import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { ChatMessageComponent } from '../chat-message.component';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-dialog-delete-message',
  templateUrl: './dialog-delete-message.component.html',
  styleUrls: ['./dialog-delete-message.component.scss', '../chat-message.component.scss']
})
export class DialogDeleteMessageComponent implements OnInit {

  messageData;
  existingUser;
  channelId;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogDeleteMessageComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService) 
    {
      this.messageData = data.messageData;
      this.existingUser = data.existingUser;
      this.channelId = data.channelID;
    }


  ngOnInit(): void {
    console.log('these is the messsageData you will delete:', this.messageData);
    console.log('these is the id you will delete:', this.messageData.id);
    console.log('these is the channelID with message:', this.channelId)
  }

  closeDialog() {
    this.dialogRef.close();
  }

  deleteMessage() {
    this.crud.deleteItem(environment.channelDb + '/' + this.channelId + '/' + 'messages' + '/' + this.messageData.id)
    .then(() => {
      this.closeDialog();
    });
  }

}
