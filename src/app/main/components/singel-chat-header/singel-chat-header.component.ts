import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot } from '@angular/fire/firestore';
import { CrudService } from '../../services/crud.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TreeService } from '../../services/tree.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogChannelEditComponent } from './dialog-channel-edit/dialog-channel-edit.component';
import { DialogShowChannelUserComponent } from './dialog-show-channel-user/dialog-show-channel-user.component';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';


@Component({
  selector: 'app-singel-chat-header',
  templateUrl: './singel-chat-header.component.html',
  styleUrls: ['./singel-chat-header.component.scss']
})
export class SingelChatHeaderComponent implements OnInit {

  constructor(public tree: TreeService, public firestore: Firestore, public crud: CrudService, public userData: UserService, private route: ActivatedRoute, public dialog: MatDialog) {

  }

  @Output() arrayUpdated = new EventEmitter<any[]>();
  @Input() currentUser: string = '';
  @Input() channelID: string = '';
  channel: any;
  channelUser: Array<any> = [];
  allUserDataInfo: Array<any> = [];
  existingUser: Array<any> = [];
  creatorID: string = '';
  channelCreatorName: string = '';


  ngOnInit(): void {
    this.route.params.subscribe(() => {
      this.getCurrentChannelInfo();
      this.checkUserDataFromDb();
    })
  }


  getCurrentChannelInfo() {
    let allChannels: Array<any> = [];
    this.channel = [];
    this.channelUser = [];
    this.crud.getItem(environment.channelDb).subscribe((result) => {
      allChannels = result;
      this.channel = allChannels.find(exist => exist.id == this.channelID);
      if (this.channel) {
        if (this.channel.ids) {
          this.channel.ids.forEach((element: any) => {
            this.channelUser.push(element);
          });
        }
        if (this.channel.creator) { this.creatorID = this.channel.creator; }
      }
    });
  }

  checkUserDataFromDb() {
    this.existingUser = [];
    this.crud.getItem(environment.userDb).subscribe((result) => {
      this.allUserDataInfo = result;
      this.channelUser.forEach(element => {
        let existUser = this.allUserDataInfo.find((exist) => exist.id == element);
        this.existingUser.push(existUser);
        this.arrayUpdated.emit(this.existingUser);
      });
      if (this.channel) {
        let creator = this.allUserDataInfo.find((exist) => exist.id == this.channel.creator);
        if (creator) { this.channelCreatorName = creator.fullName }
        else { this.channelCreatorName = ''; }
      }
    });
  }

  openDialog() {
    this.dialog.open(DialogChannelEditComponent, {
      data: {
        channelName: this.channel.name,
        channelDescritpion: this.channel.description,
        channelUser: this.existingUser,
        channelCreatorName: this.channelCreatorName,
        channelId: this.channelID,
        currentUser: this.currentUser
      }
    });
  }

  openDialogShowUser() {
    this.dialog.open(DialogShowChannelUserComponent, {
      data: {
        channelUser: this.existingUser,
      }
    });
  }

  viewUsersProfile(userId:any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.existingUser
      }
    });
  }


}
