import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from 'src/app/main/services/crud.service';
import { AddedUserToChannel } from '../../workspace/add-people-to-channel/added-user-to-channel';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['../../workspace/add-people-to-channel/add-people-to-channel.component.scss', './dialog-add-user.component.scss']
})
export class DialogAddUserComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogAddUserComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService) { }

  channelName: string = '';
  description: string = '';
  channelPath: string = '';

  addPeople: boolean = false;
  searchTerm: string = '';
  dmUsers: any = [];
  addedToChannel: any = [];
  addedToChannelIds: any = [];
  searchUser: boolean = false;
  uid: string = '';
  placeholder: boolean = true;


  ngOnInit(): void {

  }


  addUserToChannel(img: string, name: string, id: string) {
    let searchUser:any = document.getElementById('searchUserNew');
    if (img && name && id) {
      const addedUser = {
        photoURL: img,
        fullName: name,
        uid: id,
      };

      const index = this.addedToChannel.findIndex((user: AddedUserToChannel) => (
        user.photoURL === addedUser.photoURL &&
        user.fullName === addedUser.fullName &&
        user.uid === addedUser.uid
      ));

      if (index === -1) {
        this.addedToChannel.push(addedUser);
        this.addedToChannelIds.push(addedUser.uid);
      }
    }
    searchUser.value = '';
    this.searchUser = false;
  }

  removeFromAddList(i: number) {
    this.addedToChannel.splice(i, 1);
  }

  setPlaceholder() {
    this.placeholder = false;
  }


  searchUserNew(event: any) {
    const searchTerm = event.target.value;
    this.dmUsers = [];

    const userDocRef = this.crud.getItem(environment.userDb);
    userDocRef.subscribe((response: any[]) => {
      if (searchTerm !== '') {
        this.searchUser = true;
        this.dmUsers = response.filter((doc) =>
          this.checkFieldsContainSearchTerm(doc, searchTerm) 
        );    
      } else {
        this.searchUser = false;
      }
    });
  }


  private checkFieldsContainSearchTerm(doc: any, searchTerm: string): boolean {
    return doc.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  }


}
