import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CrudService } from '../../services/crud.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { TreeService } from '../../services/tree.service';
import { ActivatedRoute } from '@angular/router';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../singel-chat-header/dialog-channel-edit/dialog-channel-edit.component';
import { SingelChatHeaderComponent } from '../singel-chat-header/singel-chat-header.component';


@Component({
  selector: 'app-singel-chat',
  templateUrl: './singel-chat.component.html',
  styleUrls: ['./singel-chat.component.scss']
})

export class SingelChatComponent implements OnInit {
  @ViewChild(SingelChatHeaderComponent) singelChatheaderfunction: SingelChatHeaderComponent | undefined;
  isChatArea: boolean = true;
  isThread: boolean = false;
  userMessages: Array<any> = [];
  threadId: string = 'todelete';
  chatDays: Array<any> = [];
  timestamp: any = new Date().toDateString();
  userName!: any;
  channelId!: string;
  currentChannel: Array<any> = [];
  existingUser: Array<any> = [];
  channelType:string = '';
  allgemein: string = '';

  constructor(public tree:TreeService, public firestore: Firestore, public crud: CrudService, private elementRef: ElementRef, public userData: UserService, private route: ActivatedRoute, public dialog: MatDialog) {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);
  }


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.channelId = params['id'];
      this.getCurrentChannelInfo();
      this.getMessages();
      this.getUserName();
      setTimeout(() => {
        this.scrollToBottom();
      }, 2000);
    })
  }


  sortArray() {
    this.userMessages = this.userMessages.sort((a, b) => {
      if (a.timestamp < b.timestamp) { return -1 }
      if (a.timestamp > b.timestamp) { return 1 }
      return 0
    });
  }

  getUserName() {
    this.userName = this.userData.userDBId;
  }

  getMessages() {
    let path = environment.channelDb + '/' + this.channelId + '/' + 'messages';
    this.crud.getItem(path).subscribe((result) => {
      this.userMessages = result;
      this.sortArray();
      this.getChatDays();
    });
  }

  getChatDays() {
    this.chatDays = [];
    for (let i = 0; i < this.userMessages.length; i++) {
      let element = this.userMessages[i].timestamp;
      let time = new Date(element);
      let timeSepertor = time.toDateString();

      let chatDay = {
        day: timeSepertor,
        timestamp: element,
        today: ''
      }

      let existDay = this.chatDays.find(exist => exist.day == chatDay.day);
      if (!existDay) { this.chatDays.push(chatDay) }
      this.checkForToday();
    }
  }

  checkForToday() {
    let today = this.chatDays.find(c => c.day == this.timestamp);
    if (today) { today.today = 'Heute'; }
  }

  scrollToBottom(): void {
    let anchor: any = document.getElementById('anchor');
    anchor.scrollIntoView({ behavior: "smooth" });
  }


  getCurrentChannelInfo() {
    let allChannels:Array<any> = [];
    this.crud.getItem(environment.channelDb).subscribe((result) => {
      allChannels = result;
      let currentChannel = allChannels.find(exist => exist.id == this.channelId);
      this.currentChannel = [];
      // this.currentChannel = currentChannel;
      this.currentChannel.push(currentChannel);
      if(currentChannel){
        this.channelType = currentChannel.type;
      }
      
    });
  }

  onArrayUpdated(newArray: any[]) {
    this.existingUser = newArray;
  }

  viewUsersProfile(userId:any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.existingUser
      }
    });
  }

  showChannelDialog() {
    this.singelChatheaderfunction?.openDialog();
  }
  
}
