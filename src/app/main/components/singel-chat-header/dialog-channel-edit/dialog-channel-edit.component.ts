import { Component, Inject, OnInit } from '@angular/core';
import { DocumentReference, Firestore, arrayRemove, arrayUnion, doc, updateDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/main/services/crud.service';
import { EditorService } from 'src/app/main/services/editor.service';
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


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogChannelEditComponent>, public firestore: Firestore, public crud: CrudService, private route: ActivatedRoute, private router: Router, private editorService: EditorService) {
    this.channelName = data.channelName;
    this.channelDescription = data.channelDescritpion;
    this.channelUser = data.channelUser;
    this.channelCreatorName = data.channelCreatorName;
    this.channelId = data.channelId;
    this.currentUser = data.currentUser;
  }


  ngOnInit(): void {

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
      name: changes?.innerHTML,
      searchTerms: this.generateSearchTerms(changes.innerHTML, 'name')
    };
    updateDoc(docInstance, updateData)
      .then(() => {
        this.channelName = changes.innerHTML;
        this.viewEditChannelName();
      })
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
      description: changes?.innerHTML,
      searchTerms: this.generateSearchTerms(changes.innerHTML, 'description')
    };
    updateDoc(docInstance, updateData)
      .then(() => {
        this.channelDescription = changes.innerHTML;
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

  generateSearchTerms(input: string, changeType: string): string[] {
    let channelDescriptionSearchTerms: any = [];
    let channelNameSearchTerms: any = [];

    if (changeType === 'name') {
      channelDescriptionSearchTerms = this.editorService.messageToSearchTerms(this.channelDescription);
      channelNameSearchTerms = this.editorService.messageToSearchTerms(input);
    } else if (changeType === 'description') {
    channelDescriptionSearchTerms = this.editorService.messageToSearchTerms(input);
    channelNameSearchTerms = this.editorService.messageToSearchTerms(this.channelName);
    } else {
    console.error ("No changeType set in update functions");
   }
   
    let searchTerms: string[] = []
    searchTerms = searchTerms.concat(channelNameSearchTerms, channelDescriptionSearchTerms)    
    return searchTerms;
  }


}
