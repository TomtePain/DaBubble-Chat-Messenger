import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  Firestore,
  doc,
  updateDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { map, Subject, takeUntil } from 'rxjs';
import { ReactionService } from '../../services/reaction.service';
import { environment } from 'src/environments/environment';
import { CrudService } from '../../services/crud.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { user } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { DialogDeleteMessageComponent } from './dialog-delete-message/dialog-delete-message.component';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
  @Input() messageData: any;
  @Input() messageDataIndex: any;
  @Input() userName!: string;
  @Input() channelID!: string;
  @Output() threadCreate = new EventEmitter<string>();
  @Output() tempThreadInput = new EventEmitter<any>();
  isThread: boolean = false;
  @Input() isThreadMessage: boolean = false;
  editActive: boolean = false;
  isLastMessageToday: boolean = false;
  sortedReactionTypes!: Array<string>;
  staticReactionTypes!: Array<string>;
  allUserDataInfo: Array<any> = [];
  existingUser: any;
  amountThreadMessages!: number;
  lastThreadTimeStamp!: number;
  private destroy$ = new Subject<void>();

  constructor(
    public firestore: Firestore,
    public crud: CrudService,
    private reactionservice: ReactionService,
    private userservice:UserService,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    if (this.messageData.threadId) {
      this.getThreadData(this.messageData);
    }
    this.staticReactionTypes = this.reactionservice.staticReactionTypes;
    this.sortedReactionTypes = this.reactionservice.sortedReactionTypes;
    this.checkUserDataFromDb();
    if (this.isThreadMessage) {
      this.messageDataIndex = 999999;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messageData'] && !changes['messageData'].firstChange) {
      this.messageData = changes['messageData'].currentValue ;
    }
  }

  getThreadData(messageData: any) {
    let path =
      environment.threadDb + '/' + messageData.threadId + '/' + 'messages';

    this.crud.getItem(path).pipe(
        //Use pipe to apply actions step by step to the Observable. First map
        map((allThreadMessages) => {
          // If allThreadMessages is either not provided or an empty array, the function returns a default object with a count of 0 and a latestTimestamp of -1.
          if (!allThreadMessages || allThreadMessages.length === 0) {
            return {
              count: 0,
              latestTimestamp: 0,
            };
          }
          // If there are thread messages, take the maximum timestamp from them and return an object with the total count of messages and the latest timestamp.
          const latestTimestamp = Math.max(
            ...allThreadMessages.map((msg: any) => msg.timestamp)
          );
          return {
            count: allThreadMessages.length,
            latestTimestamp: latestTimestamp,
          };
        }),
        // Uses the takeUntil operator to automatically unsubscribe from the observable when the component is destroyed. It listens for a value emitted from the destroy$ subject (which happens in the ngOnDestroy method).
        takeUntil(this.destroy$)
      )
      .subscribe((allThreadMessages) => {
        this.amountThreadMessages = allThreadMessages.count;
        this.lastThreadTimeStamp = allThreadMessages.latestTimestamp;
        this.checkIsLastMessageToday(this.lastThreadTimeStamp);
      });
  }

  checkIsLastMessageToday(timestamp: number) {
    const dateToCompare = new Date(timestamp);
    const today = new Date();
    this.isLastMessageToday = this.compareDates(dateToCompare, today);
  }

  compareDates(date1: Date, date2: Date) {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  openThread(threadId: string) {
    // this.router.navigate([this.channelID, threadId]);
    this.router.navigate([this.channelID, "thread", threadId]);
  }

  createThread(messageId: string) {
    this.router.navigate([this.channelID, "newthread", messageId]);
  }

  bubbleEdit(i: any) {
    let options = document.getElementById(`bubble-edit${i}`);
    options?.classList.toggle('d-none');
  }

  openEditMessage(message: any, i: any) {
    this.editActive = true;
    this.bubbleEdit(i);
  }

  closeEditMessage() {
    this.editActive = false;
  }

  saveEditMessage(message: any) {
    let path = environment.channelDb + '/' + this.channelID + '/' + 'messages';
    const docInstance = doc(this.firestore, path, message.id);
    let changes: any = document.getElementById('messageChatContent');
    let updateData = {
      message: changes.value,
      updated: true,
    };

    if(changes.value == ''){
      console.log('eintrag leer')
      this.showDeleteMessageDialog();
    } else {
      console.log('eintrag nicht leer')
      this.updateDataInDb(docInstance, updateData);
    }
    
  }

  updateDataInDb(docInstance: DocumentReference, updatedData: any) {
    updateDoc(docInstance, updatedData)
      .then(() => {
        console.log('data updated', updatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  toggleReaction(type: string, messageId: string, reactionData: any) {
    const channelType = 'channel';
    this.reactionservice.toggleReaction(
      type,
      messageId,
      reactionData,
      channelType,
      this.channelID
    );
  }

  showMoreEmojis(i: any) {
    console.log(this.sortedReactionTypes);

    if(this.isThreadMessage) {
    for (let j = 0; j < this.sortedReactionTypes.length; j++) {
      let emojiElement = document.getElementById(
        `emoji-${this.sortedReactionTypes[j]}${i}`
      );
      emojiElement?.classList.toggle('d-none');
    }
  } else {
    for (let j = 2; j < this.sortedReactionTypes.length; j++) {
      let emojiElement = document.getElementById(
        `emoji-${this.sortedReactionTypes[j]}${i}`
      );
      emojiElement?.classList.toggle('d-none');
    }
  }
  }

  showEmojiBubble(i: any) {
    let emojiContainer;
    if (this.isThreadMessage) {
      emojiContainer = document.getElementById(`thread-emoji-container`);
    }
    else {
      emojiContainer = document.getElementById(`emoji-container${i}`);
    }
    emojiContainer?.classList.toggle('d-none');
  }

  checkUserDataFromDb() {
    this.allUserDataInfo = this.userservice.allUsers;
    let existUser = this.allUserDataInfo.find((exist) => exist.id == this.messageData['user']);
    this.existingUser = existUser;
  }

  getCurrentUser() {
    let localStorageItem = localStorage.getItem('userId') as string;
    this.userName = localStorageItem;
  }

  viewUsersProfile(userId:any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.allUserDataInfo
      }
    });
  }

  showDeleteMessageDialog() {
    this.dialog.open(DialogDeleteMessageComponent)
  }

}
