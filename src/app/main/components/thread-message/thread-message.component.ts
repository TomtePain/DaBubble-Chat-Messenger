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
  styleUrls: ['./thread-message.component.scss']
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
  reactionBarOpen: boolean = false;

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
    this.reactionBarOpen = !this.reactionBarOpen;
    console.log("this.reactionBarOpen", this.reactionBarOpen);
    
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
      this.reactionBarOpen = false;
      console.log("this.reactionBarOpen", this.reactionBarOpen);
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


}