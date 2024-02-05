import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CrudService } from '../../services/crud.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TreeService } from '../../services/tree.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from './dialog-channel-edit/dialog-channel-edit.component';
import { DialogShowChannelUserComponent } from './dialog-show-channel-user/dialog-show-channel-user.component';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { DialogAddUserComponent } from './dialog-add-user/dialog-add-user.component';
import { RefreshService } from '../../services/refresh.service';


@Component({
  selector: 'app-singel-chat-header',
  templateUrl: './singel-chat-header.component.html',
  styleUrls: ['./singel-chat-header.component.scss']
})
export class SingelChatHeaderComponent implements OnInit {

  constructor(public tree: TreeService, public firestore: Firestore, public crud: CrudService, public userservice: UserService, private route: ActivatedRoute, public dialog: MatDialog, private refreshService: RefreshService) {

  }

  @Output() arrayUpdated = new EventEmitter<any[]>();
  @Input() currentUser: string = '';
  @Input() channelID: string = '';
  channel: any;
  own: boolean = false;
  channelUser: Array<any> = [];
  allUserDataInfo: Array<any> = [];
  existingUser: Array<any> = [];
  creatorID: string = '';
  channelCreatorName: string = '';



  ngOnInit(): void {
    this.refreshService.refreshObservable.subscribe(() => {
      this.refreshData();
    });
    this.route.params.subscribe(() => {
      this.getCurrentChannelInfo();
      // setTimeout(() => {
      //   this.checkUserDataFromDb();
      // }, 2000);
    })
  }

  refreshData() {
    this.checkUserDataFromDb();
  }

  getCurrentChannelInfo() {
    let allChannels: Array<any> = [];
    this.channel = [];
    this.channelUser = [];
    this.crud.getItem(environment.channelDb).subscribe((result) => {
      allChannels = result;
      this.channel = allChannels.find(exist => exist.id == this.channelID);
      if (this.channel) {
        this.own = this.channel.own;
        if (this.channel.ids) {
          this.channelUser = []; 
          this.channel.ids.forEach((element: any) => {
            this.channelUser.push(element);
          });
        }
        if (this.channel.creator) { this.creatorID = this.channel.creator; }
        this.checkUserDataFromDb();
      }
    });
  }

  checkUserDataFromDb() {
    this.existingUser = [];
    this.allUserDataInfo = this.userservice.allUsers;
    this.channelUser.forEach(element => {
      let existUser = this.allUserDataInfo.find((exist) => exist.id == element);
      this.existingUser.push(existUser);
    });
    if (this.channel) {
      let creator = this.allUserDataInfo.find((exist) => exist.id == this.channel.creator);
      if (creator) { this.channelCreatorName = creator.fullName }
      else { this.channelCreatorName = ''; }
    }
  }

  openDialog() {
    this.dialog.open(DialogChannelEditComponent, {
      data: {
        channelName: this.channel.name,
        channelDescritpion: this.channel.description,
        channelUser: this.existingUser,
        channelCreatorName: this.channelCreatorName,
        channelId: this.channelID,
        currentUser: this.currentUser,
        refreshData: this.ngOnInit.bind(this)
      }
    });
  }

  openDialogShowUser() {
    this.dialog.open(DialogShowChannelUserComponent, {
      data: {
        channelUser: this.existingUser,
        channelName: this.channel.name,
        channelId: this.channelID,
        refreshData: this.ngOnInit.bind(this)
      }
    });
  }

  viewUsersProfile(userId: any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.existingUser
      }
    });
  }


  openAddUserDialog() {
    this.dialog.open(DialogAddUserComponent, {
      data: {
        channelName: this.channel.name,
        channelUser: this.channel.ids,
        channelId: this.channelID,
        refreshData: this.ngOnInit.bind(this)
      }
    });
  }


  // clearFakeUser() {
  //   let fakeIds:any = [];
  //   let trueUser:Array<any> = [];
  //   let exist:any = this.existingUser.filter((user) => user != undefined);
  //   exist.forEach((exist:any) => {
  //     let userID = exist.id
  //     trueUser.push(userID);
  //   })
  //   console.log('tureUSer:', trueUser)

  //   trueUser.forEach((check) => {
  //     let index = this.channelUser.indexOf(check);

  //     if(index !== 1) {
  //       let fakes = this.channelUser.splice(index, 1);
  //     }
  //   })
  //   fakeIds = this.channelUser;
  // }

}
