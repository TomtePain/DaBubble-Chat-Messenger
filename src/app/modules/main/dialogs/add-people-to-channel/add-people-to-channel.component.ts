import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from '../../../../core/services/crud.service';
import { AddedUserToChannel } from '../../../../core/interfaces/added-user-to-channel';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EditorService } from 'src/app/core/services/editor.service';
import { UserService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-add-people-to-channel',
  templateUrl: './add-people-to-channel.component.html',
  styleUrls: ['./add-people-to-channel.component.scss']
})
export class AddPeopleToChannelComponent {
  channelName: string = '';
  description: string = '';
  channelPath: string = '';
  searchTerms: string[] = [];
  
  addPeople: boolean = false;
  searchTerm: string = '';
  dmUsers: any = [];
  addedToChannel: any = [];
  addedToChannelIds: any = [];
  searchUser: boolean = false;
  uid: string = '';
  placeholder: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private crud: CrudService, private editorService: EditorService, private firestore: Firestore, private dialogRef: MatDialogRef<AddPeopleToChannelComponent>, public userservice: UserService) { }
  @ViewChild('userInput') inputField: any;
  ngOnInit() {
    this.getVariables();
  }

  getVariables() {
    this.channelName = this.data.channelName;
    this.description = this.data.description;
    this.channelPath = this.data.channelPath;
    this.searchTerms = this.generateSearchTerms();
    this.uid = this.data.uid;
  }

  async onSubmit() {
    try {
      await this.getAddedToChannelIds();
      const newChannel = {
        name: this.channelName,
        description: this.description,
        img: 'assets/images/workspace-images/tag.svg',
        ids: this.addedToChannelIds,
        searchTerms: this.searchTerms,
        creator: this.uid,
        type:'channel'
      };

      this.crud.addItem(newChannel, this.channelPath)
        .then(() => {
          this.closeDialog();
        });
    } catch (error) {
      console.error(error);
    }
  }

  async getAddedToChannelIds() {
    return new Promise<void>((resolve, reject) => {
      if (this.addPeople) {
        this.addedToChannelIds = this.addedToChannel.map((added: { uid: string }) => added.uid);
        this.addedToChannelIds.push(this.uid);
        resolve();
      } else {
        this.crud.getItem(environment.userDb).subscribe(
          (user) => {
            this.addedToChannelIds = user.map((added: { id: string }) => added.id);
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }


  addUserToChannel(img: string, name: string, id: string) {
    let inputField:any = document.getElementById('search-user-input-field');
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
        inputField.value = '';
      } 
    }
  }

  removeFromAddList(i: number) {
    this.addedToChannel.splice(i, 1);
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


  closeDialog() {
    this.dialogRef.close();
  }

  changeAddPeople(state: boolean) {
    this.addPeople = state;

  }
  setPlaceholder() {
    this.placeholder = false;
  }

  generateSearchTerms(): string[] {
    let channelDescriptionSearchTerms: any = [];
    let channelNameSearchTerms: any = [];

    channelDescriptionSearchTerms = this.editorService.messageToSearchTerms(this.description);
    channelNameSearchTerms = this.editorService.messageToSearchTerms(this.channelName);
   
    let searchTerms: string[] = []
    searchTerms = searchTerms.concat(channelNameSearchTerms, channelDescriptionSearchTerms)    
    return searchTerms;
  }
}
