import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { UserService } from '../../services/user.service';
import { DialogDeleteMessageComponent } from './dialog-delete-message/dialog-delete-message.component';
import { getStorage, ref, deleteObject } from '@angular/fire/storage';
import { UploadComponent } from '../../dialogs/upload/upload.component';
import { EditorService } from '../../services/editor.service';

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
  @Input() channelUser: any;
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
  showEmojiPicker = false;
  message: any = '';
  channelUserNames: Array<any> = [];

  constructor(
    public firestore: Firestore,
    public crud: CrudService,
    private reactionservice: ReactionService,
    private userservice: UserService,
    private router: Router,
    public dialog: MatDialog,
    public editorService: EditorService
  ) { }

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
    this.getChannelUserNames();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messageData'] && !changes['messageData'].firstChange) {
      this.messageData = changes['messageData'].currentValue;
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

  openHidedDeleteBtn(i: any) {
    let open = document.getElementById(`openHidedDeleteBtn${i}`);
    open?.classList.toggle('d-none');
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
      messageLowercase: this.editorService.messageToLowercase(changes.value),
      searchTerms: this.editorService.messageToSearchTerms(changes.value)
    };

    if (changes.value == '') {
      this.showDeleteMessageDialog();
    } else {
      this.updateDataInDb(docInstance, updateData);
    }

  }

  updateDataInDb(docInstance: DocumentReference, updatedData: any) {
    updateDoc(docInstance, updatedData);
  }

  toggleReaction(type: string, messageId: string, reactionData: any) {
    const channelType = 'channel';
    this.reactionservice.toggleReaction(type, messageId, reactionData, channelType, this.channelID);
  }

  showMoreEmojis(i: any) {
    if (this.isThreadMessage) {
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

  viewUsersProfile(userId: any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.allUserDataInfo
      }
    });
  }

  showDeleteMessageDialog() {
    this.dialog.open(DialogDeleteMessageComponent, {
      data: {
        messageType: 'chat',
        messageData: this.messageData,
        existingUser: this.existingUser,
        channelID: this.channelID,
        userID: this.userservice.userDBId
      }
    })
  }

  deleteUploadedFile() {
    const storage = getStorage();
    const spaceRef = ref(storage, `/upload/${this.userservice.userDBId}/` + this.messageData.uploadFileName);
    let path = environment.channelDb + '/' + this.channelID + '/' + 'messages';
    const docInstance = doc(this.firestore, path, this.messageData.id);

    deleteObject(spaceRef).then(() => {
      let updateData = {
        uploadFile: false,
        uploadFileName: false,
      };
      this.updateDataInDb(docInstance, updateData);
      this.showUploadDialog('delete data');
    })
  }


  checkForPDF() {
    let name: string = this.messageData.uploadFileName;
    let splitedName: string[] = name.split('.');
    let lastPc: string = splitedName[splitedName.length - 1];
    return lastPc
  }

  showUploadDialog(msg: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: { typeOfMessage: msg },
    });
  }


  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    let input: any = document.getElementById('messageChatContent');
    const text = `${input.value}${event.emoji.native}`;
    input.value = text;
    this.showEmojiPicker = false;
  }

  hideBoxes() {
    this.showEmojiPicker = false;
  }

  ///////////////////////////////////////////////////////////////////

  // START EXPERIMENTAL 

  ///////////////////////////////////////////////////////////////////

  getChannelUserNames() {
    this.channelUserNames = [];
    if (this.channelUser) {
      this.channelUser.forEach((name: any) => {
        this.channelUserNames.push(name['fullName']);
      })
    }
  }


  splitText(allowedNames: any[]): string {
    let result = this.messageData.message;
    let markedNames = document.querySelectorAll(".highlight-message-names");

    if (this.messageData.markedUser) {
      this.messageData.markedUser.forEach((data: any) => {
        const regex = new RegExp(`@${data.fullName}`, 'g');
        result = result.replace(regex, `<span class="highlight-message-names">@${data.id}</span>`);
      })
    } else {
      allowedNames.forEach((name) => {
        const regex = new RegExp(`@${name.fullName}`, 'g');
        result = result.replace(regex, `<span class="highlight-message-names">@${name.id}</span>`);
      });
    }

    markedNames.forEach((item) => {
      if (this.messageData.markedUser) {
        this.messageData.markedUser.forEach((data: any) => {
          if (item.innerHTML.slice(1) == data.id) {
            item.setAttribute('data-name', data.id);
            item.innerHTML = `@${data.fullName}`;
          }
        });
      } 
    })

    return result;
  }

  handleNameClick(event: any): void {
    if (event.target.classList.contains('highlight-message-names')) {
      let clickedName = event.target.getAttribute('data-name');
      let exist = this.channelUser.find((userName: any) => userName.id == clickedName);
      if (exist) {
        this.viewUsersProfile(exist.id)
      }
    }
  }





}
