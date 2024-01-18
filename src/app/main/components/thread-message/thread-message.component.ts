import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentReference, Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { CrudService } from '../../services/crud.service';
import { environment } from 'src/environments/environment';
import { ReactionService } from '../../services/reaction.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { UserService } from '../../services/user.service';
import { EditorService } from '../../services/editor.service';
import { DialogDeleteMessageComponent } from '../chat-message/dialog-delete-message/dialog-delete-message.component';

@Component({
  selector: 'app-thread-message',
  templateUrl: './thread-message.component.html',
  styleUrls: ['./thread-message.component.scss', '../chat-message/chat-message.component.scss']
})
export class ThreadMessageComponent implements OnInit{
  @Input() messageData: any;
  @Input() messageDataIndex: any;
  @Input() userName!:string;
  @Input() threadId!:string;
  @Output() threadOpened: EventEmitter<void> = new EventEmitter<void>();
  sortedReactionTypes!: Array<string>;
  staticReactionTypes!: Array<string>;
  isThread: boolean = false;
  editActive:boolean = false;
  allUserDataInfo:Array<any> = [];
  existingUser:any;
  showEmojiPicker = false;
  channelUserNames:Array<any> = [];

  constructor(public firestore: Firestore, public crud: CrudService, public reactionservice:ReactionService, public dialog: MatDialog, private userservice: UserService, public editorService: EditorService) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.checkUserDataFromDb();
    this.staticReactionTypes = this.reactionservice.staticReactionTypes;
    this.sortedReactionTypes = this.reactionservice.sortedReactionTypes;
  }

  bubbleEdit(i: any) {
    let options = document.getElementById(`bubble-thread-edit${i}`);
    options?.classList.toggle('d-none');
  }

  openEditMessage(message:any, i:any) {
    this.editActive = true;
    this.bubbleEdit(i);
  }

  closeEditMessage() {
    this.editActive = false;
  }

  saveEditMessage(message: any) {
    let path = environment.threadDb + '/' + this.threadId + '/' + 'messages';
    const docInstance = doc(this.firestore, path, message.id);
    const isEmptyOrSpaces = (str: string) => /^[\s]*$/.test(str);
    let changes: any = document.getElementById('message-thread-content');
    
    let updateData = {
      message: changes.value,
      updated: true,
      messageLowercase: this.editorService.messageToLowercase(changes.value),
      searchTerms: this.editorService.messageToSearchTerms(changes.value) 
    };

    

    if(isEmptyOrSpaces(changes.value) || (changes.value && isEmptyOrSpaces(changes.value))){
      this.showDeleteMessageDialog();
    } else {
      this.updateDataInDb(docInstance, updateData);
    }
  }

  updateDataInDb(docInstance: DocumentReference, updatedData: any) {
    updateDoc(docInstance, updatedData);
  }

  showMoreEmojis(i: any) {
    for (let j = 0; j < this.sortedReactionTypes.length; j++) {
      let emojiElement = document.getElementById(
        `thread-emoji-${this.sortedReactionTypes[j]}${i}`
      );
      emojiElement?.classList.toggle('d-none');
    }
  }

  showEmojiBubbleThread(i:any) {
    let emojiContainer = document.getElementById(`thread-emoji-container${i}`);
    emojiContainer?.classList.toggle('d-none');
  }

  checkUserDataFromDb() {
    this.allUserDataInfo = this.userservice.allUsers;
    let existUser = this.allUserDataInfo.find(exist => exist.id == this.messageData['user']);
    this.existingUser = existUser;
  }

  toggleReaction(type: string, messageId: string, reactionData: any) {
    if (this.threadId) {
      this.reactionservice.toggleReaction(type, messageId, reactionData, 'thread', this.threadId);
  } else {
    console.error('this.threadId does not exists');
  }
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
    this.dialog.open(DialogDeleteMessageComponent, {
      data: {
        messageType: 'thread',
        messageData: this.messageData,
        existingUser : this.existingUser,
        channelID: this.threadId,
        userID: this.userservice.userDBId
      }
    })
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    let input:any = document.getElementById('message-thread-content');
    const text = `${input.value}${event.emoji.native}`;
    input.value = text;
    this.showEmojiPicker = false;
  }

  openHidedDeleteBtn(i:any) {
    let open = document.getElementById(`openHidedDeleteBtnThread${i}`);
    open?.classList.toggle('d-none');
  }


  checkForPDF() {
    let name: string = this.messageData.uploadFileName;
    let splitedName: string[] = name.split('.');
    let lastPc: string = splitedName[splitedName.length - 1];
    return lastPc
  }

  /////// START FOR NEW BUILD /////

  getChannelUserNames() {
    this.channelUserNames = [];
    if (this.editorService.usersData) {
      this.editorService.usersData.forEach((name: any) => {
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
      let exist = this.editorService.usersData.find((userName: any) => userName.id == clickedName);
      if (exist) {
        this.viewUsersProfile(exist.id)
      }
    }
  }

}