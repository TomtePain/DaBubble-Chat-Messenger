import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DocumentReference, Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { CrudService } from '../../../../core/services/crud.service';
import { UserService } from '../../../../core/services/user.service';
import { EditorService } from '../../../../core/services/editor.service';
import { UserProfile } from 'src/app/core/interfaces/user-profile';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../../dialogs/upload/upload.component';
import { File } from '../../../../core/interfaces/file';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})

export class EditorComponent implements OnInit {
  @Output("scrollToBottom") scrollToBottom: EventEmitter<any> = new EventEmitter();
  @Input() isThreadArea: boolean = false;
  @Input() isNewThread: boolean = false;;
  @Input() isChatArea: boolean = false;
  @Input() threadId!: string;
  @Input() channelId!: string;
  @Input() mainMessageId: any;
  @Input() channelUser: any;
  @Input() currentChannel: Array<any> = [];
  @Input() channelType: string = '';
  @ViewChild('keyPress', { static: false }) keyPress!: ElementRef;
  @ViewChild('searchFieldUser') searchFieldUser!: ElementRef;
  @ViewChild('searchFieldChannel') searchFieldChannel!: ElementRef;
  searchResult: Array<UserProfile> = [];
  searchResultForChannel: Array<any> = [];
  searchMarktUsers: boolean = false;
  searchMarktChannel: boolean = false;
  searchUserInput: string = '';
  lastIndexOfAt: number = 0;
  lastIndexOfRaute: number = 0;
  timestamp: any;
  userName: any = this.userservice.userDBId;
  user: Array<any> = [];
  channelUsers: Array<any> = [];
  showEmojiPicker = false;
  message: any = '';
  lastAtPosition = -1;
  lastHashPosition = -1;
  uploadedData: boolean = false;
  uploadedDataName: string = '';
  private routerSubscription: Subscription;
  markedUsers: Array<any> = [];
  markedUsersInText: Array<any> = [];
  markedChannel: Array<any> = [];
  markedChannelinText: Array<any> = [];
  cursorPosition: number = 0;

  constructor(public firestore: Firestore, public crud: CrudService, public userservice: UserService, private route: ActivatedRoute, private router: Router, public editorService: EditorService, public dialog: MatDialog) {
    //Clears the editor in Single Chat and Editor everytime a route changes.
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.message = '';
        this.uploadedData = false;
        this.uploadedDataName = '';
        this.editorService.fileUrl = '';
        this.editorService.fileName = '';
      }
    });
  }


  ngOnInit(): void {
    this.editorService.subSingelData(this.channelId);
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  addNewMessageKeyBoard(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault(); // This will prevent the default Enter key behavior (i.e., new line)
      this.addNewMessage();
    }
  }

  addNewMessageThreadKeyBoard(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault(); // This will prevent the default Enter key behavior (i.e., new line)
      this.addNewMessageThread();
    }
  }

  addNewThreadKeyBoard(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault(); // This will prevent the default Enter key behavior (i.e., new line)
      this.addNewThread();
    }
  }

  addNewMessage() {
    let timeStamp = new Date();
    let content: any = document.getElementById('text');
    let fileURL;
    let fileName;

    if (this.editorService.fileUrl == '') {
      fileURL = false;
      fileName = false;
    } else {
      fileURL = this.editorService.fileUrl;
      fileName = this.editorService.fileName
    }

    let newMessage = {
      user: this.userName,
      timestamp: timeStamp.getTime(),
      message: content.value,
      markedUser: this.markedUsersInText,
      markedChannel: this.markedChannelinText,
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value)
    }

    this.checkMarkedUser(content.value);
    this.checkMarkedChannel(content.value);

    if (content.value != '') {
      this.crud.addItem(newMessage, environment.channelDb + '/' + this.channelId + '/' + 'messages').then(() => {
        content.value = '';
        this.editorService.fileUrl = '';
        this.uploadedDataName = '';
        this.uploadedData = false;
        this.message = '';
        this.markedUsers = [];
        this.markedUsersInText = [];
        this.markedChannel = [];
        this.markedChannelinText = [];
        setTimeout(() => {
          this.scrollToBottom.emit()
        }, 500);
      });
    }
  }

  addNewMessageThread() {
    let timeStamp = new Date();
    let content: any = document.getElementById('thread-text');
    let fileURL;
    let fileName;

    if (this.editorService.fileUrl == '') {
      fileURL = false;
      fileName = false;
    } else {
      fileURL = this.editorService.fileUrl;
      fileName = this.editorService.fileName
    }

    let newMessage = {
      user: this.userName,
      timestamp: timeStamp.getTime(),
      message: content.value,
      markedUser: this.markedUsersInText,
      markedChannel: this.markedChannelinText,
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value)
    }

    this.checkMarkedUser(content.value);
    this.checkMarkedChannel(content.value);

    if (content.value != '') {
      this.crud.addItem(newMessage, environment.threadDb + '/' + this.threadId + '/' + 'messages');
      content.value = '';
      this.message = '';
      this.editorService.fileUrl = '';
      this.uploadedDataName = '';
      this.uploadedData = false;
      this.markedUsers = [];
      this.markedUsersInText = [];
      this.markedChannel = [];
      this.markedChannelinText = [];
      setTimeout(() => {
        this.scrollToBottom.emit()
      }, 500)
    }
  }

  addNewThread() {
    let timeStamp = new Date();
    let content: any = document.getElementById('new-thread-text');
    let path = environment.channelDb + '/' + this.channelId + '/' + 'messages';
    const docInstance: DocumentReference = doc(this.firestore, path, this.mainMessageId);

    let fileURL;
    let fileName;

    if (this.editorService.fileUrl == '') {
      fileURL = false;
      fileName = false;
    } else {
      fileURL = this.editorService.fileUrl;
      fileName = this.editorService.fileName
    }


    let newMessage = {
      user: this.userName,
      timestamp: timeStamp.getTime(),
      message: content.value,
      markedUser: this.markedUsersInText,
      markedChannel: this.markedChannelinText,
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value)
    }

    this.checkMarkedUser(content.value);
    this.checkMarkedChannel(content.value);

    let newThread = {
      mainMessage: this.mainMessageId
    }
    if (content.value != '') {

      //Create a new thread in DB including mainMessage ID
      this.crud.addItem(newThread, environment.threadDb).then(docRef => {
        let newThreadId: string = docRef.id;
        //Then add threadId to mainMessage
        let updateData = {
          threadId: newThreadId,
        };
        this.crud.addItem(newMessage, environment.threadDb + '/' + docRef.id + '/' + 'messages')
        updateDoc(docInstance, updateData)
          .catch((error) => {
            console.error('Error creating newThread:', error);
          })
        content.value = '';
        this.editorService.fileUrl = '';
        this.uploadedDataName = '';
        this.uploadedData = false;
        this.markedUsers = [];
        this.markedUsersInText = [];
        this.markedChannel = [];
        this.markedChannelinText = [];
        //route to new thread id
        this.openThread(newThreadId)
      });
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;
    this.message = text;
    this.showEmojiPicker = false;
  }

  hideBoxes() {
    this.showEmojiPicker = false;
    this.searchMarktUsers = false;
    this.searchMarktChannel = false;
  }

  // KW SEARCH SECTION


  /**
   * Initializes the channel users and search result by setting them to the user data
   * retrieved from the editor service.
   */
  initializeChannelUsers() {
    this.channelUsers = this.editorService.usersData;
    this.searchResult = [];
    this.searchResult = this.channelUsers;
  }


  /**
   * Activates the search for market users by setting the 'searchMarktUsers' flag to true
   * and initializing channel users using the 'initializeChannelUsers()' function.
   */
  activateSearchMarketUsers() {
    this.searchMarktUsers = true;
    this.initializeChannelUsers();
  }

  /**
   * Adds a specified name to the message content.
   *
   * @param {string} name - The name to be added to the message.
  */
  addToMsg(name: string, id: string) {
    let newMessage = this.message.slice(0, this.cursorPosition + 1) + name + this.message.slice(this.cursorPosition + 1);
    this.message = newMessage;

    this.searchMarktUsers = false;
    this.markedUsers.push(id);
  }

  checkMarkedUser(message: string) {
    this.markedUsers.forEach((user) => {
      let existUser = this.userservice.allUsers.find((exist: any) => exist.id == user);
      if (existUser.fullName == message.match(existUser.fullName)) {
        if (!this.markedUsersInText.includes(existUser.id)) {
          this.markedUsersInText.push({
            fullName: existUser.fullName,
            id: existUser.id
          });
        }
      }
    })
  }


  /**
   * Handles the upload of one or more files from a drag-and-drop event.
   *
   * @param {Event} event - The drag-and-drop event triggering the file upload.
   */
  uploadFile(event: any) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    // Check if there are any files to upload
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.validateAndUploadFile(file)
      }
    }
  }

  /**
   * Handles the selection of a file via a file input field.
   *
   * @param {Event} event - The event triggered when a file is selected.
   */
  onFileSelect(event: any): void {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      this.validateAndUploadFile(selectedFile)
    }
  }

  /**
   * Validates and uploads a file to the server.
   *
   * @param {File} file - The file to be validated and uploaded.
   */
  validateAndUploadFile(file: File) {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      if (file.size <= 500 * 1024) {
        // Senden zum Server
        this.showUploadDialog('hochgeladen');
        this.editorService.uploadData(file);
        this.uploadedData = true;
        this.uploadedDataName = file.name;
      } else {
        this.showUploadDialog('big data');
      }
    } else {
      this.showUploadDialog('wrong type');
    }
  }

  /**
   * Displays an upload dialog with a specified message.
   *
   * @param {string} msg - The message to be displayed in the upload dialog.
   */
  showUploadDialog(msg: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: { typeOfMessage: msg },
    });
  }



  openThread(threadId: string) {
    this.router.navigate([this.channelId, "thread", threadId]);
  }

  checkForPDF() {
    let name: string = this.editorService.fileName;
    let splitedName: string[] = name.split('.');
    let lastPc: string = splitedName[splitedName.length - 1];
    return lastPc
  }

  setDirectMessageBodyUser() {
    let body: any;
    if (this.channelUser) {
      this.channelUser.forEach((user: any) => {
        if (user.id != this.userName && !this.currentChannel[0].own) {
          body = user;
        } else if (user.id == this.userName && this.currentChannel[0].own) {
          body = user;
        }
      });
      return body.fullName
    }
  }

  // SEARCH FOR CHANNEL

  activateSearchForChannelToMark() {
    this.searchMarktChannel = true;
    this.initChannels();
  }

  initChannels() {
    this.searchResultForChannel = [];
    this.searchResultForChannel = this.editorService.allChannel;
  }


  addChannelintoMSG(value: any, id: any) {
    let newMessage = this.message.slice(0, this.cursorPosition + 1) + value + this.message.slice(this.cursorPosition + 1);
    this.message = newMessage;

    this.searchMarktChannel = false;
    this.markedChannel.push(id);
  }

  checkMarkedChannel(message: string) {
    this.markedChannel.forEach((channel) => {
      let existChannel = this.editorService.allChannel.find((exist: any) => exist.id == channel);
      if (existChannel.name == message.match(existChannel.name)) {
        if (!this.markedChannelinText.includes(existChannel.id)) {
          this.markedChannelinText.push({
            name: existChannel.name,
            id: existChannel.id
          });
        }
      }
    })
  }


  onKeyUp(event: KeyboardEvent): void {
    if (event.key === '@') {
      let cursorPosition = (event.target as HTMLTextAreaElement).selectionStart;
      this.cursorPosition = cursorPosition;
      this.activateSearchMarketUsers();
      setTimeout(() => { this.searchFieldUser.nativeElement.focus(); }, 0);
    } else if (event.key === '#') {
      let cursorPosition = (event.target as HTMLTextAreaElement).selectionStart;
      this.cursorPosition = cursorPosition;
      this.activateSearchForChannelToMark();
      setTimeout(() => { this.searchFieldChannel.nativeElement.focus(); }, 0);
    }
  }


  activateMarkUser(): void {
    let textarea: HTMLTextAreaElement = this.keyPress.nativeElement;
    this.cursorPosition = textarea.selectionStart;

    let newMessage = this.message.slice(0, this.cursorPosition) + '@' + this.message.slice(this.cursorPosition);
    this.message = newMessage;

    this.activateSearchMarketUsers();

    setTimeout(() => {
      this.searchFieldUser.nativeElement.focus();
    }, 0);
  }


  searchResultsForUser() {
    let searchValue = this.searchFieldUser.nativeElement.value;
    this.searchResult = this.channelUsers.filter((el) => {
      return el.fullName.toLowerCase().includes(searchValue.toLocaleLowerCase());
    });
  }


  searchResultsForChannel() {
    let searchValue = this.searchFieldChannel.nativeElement.value;
    this.searchResultForChannel = this.editorService.allChannel.filter((el) => {
      return el.name.toLowerCase().includes(searchValue.toLocaleLowerCase());
    });
  }

  handleEscape(event: KeyboardEvent, type: string) {
    if (event.key === 'Escape') {
      // Code to execute when ESC is pressed
      this.hideBoxes();
      this.returnFocusToEditor();
    } else if ((type === 'channel' && event.key === 'Backspace' && this.searchFieldChannel.nativeElement.value < 1)) {
      // Code to execute when Backspace is pressed in the channel search field and the channel search field is empty
      this.hideBoxes();
      this.returnFocusToEditor();
    } else if ((type === 'user' && event.key === 'Backspace' && this.searchFieldUser.nativeElement.value < 1)) {
      // Code to execute when Backspace is pressed in the user search field and the user search field is empty
      this.hideBoxes();
      this.returnFocusToEditor();
    }  
  }

  returnFocusToEditor() {
    setTimeout(() => {
      this.keyPress.nativeElement.focus();
    }, 0);
  }
}
