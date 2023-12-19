import { Component, Inject, OnInit } from '@angular/core';
import { DocumentReference, Firestore, arrayRemove, arrayUnion, doc, updateDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadComponent } from 'src/app/main/dialogs/upload/upload.component';
import { CrudService } from 'src/app/main/services/crud.service';
import { UserService } from 'src/app/main/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialog-channel-edit',
  templateUrl: './dialog-channel-edit.component.html',
  styleUrls: ['./dialog-channel-edit.component.scss']
})
export class DialogChannelEditComponent implements OnInit {

  channelName: string;
  channelDescription: string;
  channelUser: Array<any>;
  channelCreatorName: string;
  channelId: string;
  currentUser: string;
  allChannel:Array<any> = [];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogChannelEditComponent>, public firestore: Firestore, public crud: CrudService, private route: ActivatedRoute, private router: Router,public dialog: MatDialog) {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescritpion;
    this.channelUser = data.channelUser;
    this.channelCreatorName = data.channelCreatorName;
    this.channelId = data.channelId;
    this.currentUser = data.currentUser;
  }


  ngOnInit(): void {
    this.getAllChannel();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  viewEditChannelName() {
    let editChannelName = document.getElementById('channel-name-edit');
    let savedChannelName = document.getElementById('channel-name-save');

    editChannelName?.classList.toggle('d-none');
    savedChannelName?.classList.toggle('d-none');
  }

  editChannelName() {
    const docInstance = doc(this.firestore, environment.channelDb, this.channelId);
    let changes: any = document.getElementById('channel-name');
    let updateData = {
      name: changes?.value.trim()
    };
    this.channelName = changes.value.trim();
    if(!this.checkChannelNameExist()){
      updateDoc(docInstance, updateData)
      .then(() => {
        this.channelName = changes.value.trim();
        this.viewEditChannelName();
      })
    } else { this.showUploadDialog('channel exist'); }
  }

  viewEditChannelDescription() {
    let editChannelDes = document.getElementById('channel-description-edit');
    let savedChannelDes = document.getElementById('channel-description-save');

    editChannelDes?.classList.toggle('d-none');
    savedChannelDes?.classList.toggle('d-none');
  }

  editChannelDescription() {
    const docInstance = doc(this.firestore, environment.channelDb, this.channelId);
    let changes: any = document.getElementById('channel-decription');
    let updateData = {
      description: changes?.value
    };
    updateDoc(docInstance, updateData)
      .then(() => {
        this.channelDescription = changes.value;
        this.viewEditChannelDescription();
      })
  }

  leaveChannel() {
    const docInstance = doc(this.firestore, environment.channelDb, this.channelId);
    updateDoc(docInstance, {
      ids: arrayRemove(this.currentUser)
    })
    .then(() => {
      this.closeDialog();
      this.router.navigateByUrl('/')
    });
  }

  showUploadDialog(msg: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: { typeOfMessage: msg },
    });
  }

  checkChannelNameExist() {
    let exist = this.allChannel.find(channel => channel.name == this.channelName);
    if(exist){
      return true 
    } else {
      return false
    }
  }

  getAllChannel() {
    this.crud.getItem(environment.channelDb).subscribe((result) => {
      this.allChannel = result;
    })
  }


}
