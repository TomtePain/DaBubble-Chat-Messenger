import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CrudService } from '../../../../core/services/crud.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { environment } from 'src/environments/environment';
import { UserService } from '../../../../core/services/user.service';
import { TreeService } from '../../../../core/services/tree.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../dialogs/dialog-channel-edit/dialog-channel-edit.component';
import { SingelChatHeaderComponent } from '../singel-chat-header/singel-chat-header.component';
import { Subscription, filter } from 'rxjs';
import { RefreshService } from '../../../../core/services/refresh.service';
import { ScrollService } from '../../../../core/services/scroll.service';
import { EditorService } from '../../../../core/services/editor.service';

@Component({
  selector: 'app-singel-chat',
  templateUrl: './singel-chat.component.html',
  styleUrls: ['./singel-chat.component.scss'],
})
export class SingelChatComponent implements OnInit {
  @ViewChild(SingelChatHeaderComponent) singelChatheaderfunction:
    | SingelChatHeaderComponent
    | undefined;
  isChatArea: boolean = true;
  isThread: boolean = false;
  hideMainChatOnSmallerScreens: boolean = false;
  userMessages: Array<any> = [];
  threadId: string = 'todelete';
  chatDays: Array<any> = [];
  timestamp: any = new Date().toDateString();
  userName!: any;
  channelId!: string;
  currentChannel: Array<any> = [];
  existingUser: Array<any> = [];
  channelType: string = '';
  allgemein: string = '';
  private routerSubscription!: Subscription;

  constructor(
    public tree: TreeService,
    public firestore: Firestore,
    public crud: CrudService,
    public userservice: UserService,
    public editorService: EditorService,
    private scrollService: ScrollService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private refreshService: RefreshService
  ) {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);

    //check if it is a channel or a thread URL to handle the smaller desktop behaviour of how thread and main chat are displayed
    if (this.route.children.length > 0) {
      this.hideMainChatOnSmallerScreens = true;
    }
  }

  ngOnInit(): void {
    this.refreshService.refreshObservable.subscribe(() => {
      this.refreshData();
    });
    this.subscribeToRouterEvents(); // to detect if the URL changes

    this.route.params.subscribe((params) => {
      this.channelId = params['id'];
      const messageId: string = params['messageId'];      
      this.getCurrentChannelInfo();
      this.getMessages();
      this.getUserName();
      this.scrollToMessageOrBottom(messageId);
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  scrollToMessageOrBottom(messageId: string) {
    // Ensuring the message is in the DOM before scrolling. Otherwise scroll to bottom
    if (messageId && messageId.length === 20) {
      setTimeout(() => this.scrollService.scrollToMessage(messageId), 1000);
    } else {
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }
  }

  refreshData() {
      this.getMessages();
  }

  sortArray() {
    this.userMessages = this.userMessages.sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    });
  }

  getUserName() {
    this.userName = this.userservice.userDBId;
  }

  getMessages() {
    let path = environment.channelDb + '/' + this.channelId + '/' + 'messages';
    this.crud.getItem(path).subscribe((result) => {
      this.userMessages = result;
      this.sortArray();
      this.getChatDays();
    });
  }

  subscribeToRouterEvents() {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Check the length of the route's children at the end of navigation
        if (this.route.children.length > 0) {
          this.hideMainChatOnSmallerScreens = true;
        } else {
          this.hideMainChatOnSmallerScreens = false;
        }
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
        today: '',
      };

      let existDay = this.chatDays.find((exist) => exist.day == chatDay.day);
      if (!existDay) {
        this.chatDays.push(chatDay);
      }
      this.checkForToday();
    }
  }

  checkForToday() {
    let today = this.chatDays.find((c) => c.day == this.timestamp);
    if (today) {
      today.today = 'Heute';
    }
  }

  scrollToBottom(): void {
    let anchor: any = document.getElementById('anchor');
    anchor.scrollIntoView({ behavior: 'smooth' });
  }

  getCurrentChannelInfo() {
    let allChannels: Array<any> = [];
    this.crud.getItem(environment.channelDb).subscribe((result) => {
      allChannels = result;
      let currentChannel = allChannels.find((exist) => exist.id == this.channelId);
      this.currentChannel = [];
      // this.currentChannel = currentChannel;
      this.currentChannel.push(currentChannel);
      if (currentChannel) {
        this.channelType = currentChannel.type;
        this.checkUserDataFromDb();
      }
    });   
  }

  onArrayUpdated(newArray: any[]) {
    this.existingUser = newArray;
  }

  viewUsersProfile(userId: any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.existingUser,
      },
    });
  }

  showChannelDialog() {
    this.singelChatheaderfunction?.openDialog();
  }

  checkUserDataFromDb() {
    this.existingUser = [];
    this.editorService.usersData = [];
    let channelUser = this.currentChannel[0].ids;
    channelUser.forEach((element:any) => {
      let existUser = this.userservice.allUsers.find((exist:any) => exist.id == element);
      if(existUser) {
        this.existingUser.push(existUser);
        this.editorService.usersData.push(existUser);
       };
    });
    // this.editorService.usersData = this.existingUser;
  }


 
}


