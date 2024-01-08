import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DocumentReference, Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { CrudService } from '../../services/crud.service';
import { UserService } from '../../services/user.service';
import { EditorService } from '../../services/editor.service';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../../dialogs/upload/upload.component';
import { File } from '../../interfaces/editor';
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
  @ViewChild('keyPress', { static: false }) keyPress!: ElementRef;
  searchResult: Array<UserProfile> = [];
  searchMarktUsers: boolean = false
  searchUserInput: string = '';
  lastIndexOfAt: number = 0;
  timestamp: any;
  userName: any = this.userservice.userDBId;
  user: Array<any> = [];
  channelUsers: Array<any> = [];
  showEmojiPicker = false;
  message: any = '';
  lastAtPosition = -1;
  uploadedData: boolean = false;
  uploadedDataName:string = '';
  private routerSubscription: Subscription;

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
    this.editorService.subSingelData(this.channelId)
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

    if(this.editorService.fileUrl == '') {
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
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value) 
    }

    if (content.value != '') {
      this.crud.addItem(newMessage, environment.channelDb + '/' + this.channelId + '/' + 'messages').then(() => {
        content.value = '';
        this.editorService.fileUrl = '';
        this.uploadedDataName = '';
        this.uploadedData = false;
        this.message = '';
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

    if(this.editorService.fileUrl == '') {
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
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value) 
    }
    if (content.value != '') {
      this.crud.addItem(newMessage, environment.threadDb + '/' + this.threadId + '/' + 'messages');
      content.value = '';
      this.message = '';
      setTimeout(() => {
        this.scrollToBottom.emit()
      }, 500)
    }
  }

  addNewThread() {
    let timeStamp = new Date();
    let content: any = document.getElementById('new-thread-text');
    let path = environment.channelDb + '/' + this.channelId + '/' + 'messages';
    const docInstance:DocumentReference = doc(this.firestore, path, this.mainMessageId);
    
    let fileURL;
    let fileName;

    if(this.editorService.fileUrl == '') {
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
      uploadFile: fileURL,
      uploadFileName: fileName,
      messageLowercase: this.editorService.messageToLowercase(content.value),
      searchTerms: this.editorService.messageToSearchTerms(content.value) 
    }
  
    let newThread = {
      mainMessage: this.mainMessageId
    }
    if (content.value != '') {
      
      //Create a new thread in DB including mainMessage ID
      this.crud.addItem(newThread, environment.threadDb).then(docRef => {
      let newThreadId:string = docRef.id;
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
  }

  // KW SEARCH SECTION

  /**
   * Initializes the channel users and search result by setting them to the user data
   * retrieved from the editor service.
   */
  initializeChannelUsers() {
    this.channelUsers = this.editorService.usersData
    this.searchResult = this.channelUsers
  }

  /**
   * Updates the message by appending '@', sets the cursor, triggers the keyup event,
   * and activates the search for market users.
   */
  updateMessageAndSearch() {
    this.message = this.message + '@';
    this.setCursor();
    this.triggerKeyup();
    this.activateSearchMarketUsers();
  }

  /**
   * Activates the search for market users by setting the 'searchMarktUsers' flag to true
   * and initializing channel users using the 'initializeChannelUsers()' function.
   */
  activateSearchMarketUsers() {
    this.searchMarktUsers = true
    this.initializeChannelUsers();
  }

  /**
   * Triggers a 'keyup' event programmatically by creating a KeyboardEvent with the specified key
   * and dispatching it on the native element referenced by 'keyPress'.
   */
  triggerKeyup() {
    const event = new KeyboardEvent('keyup', {
      bubbles: true,
      cancelable: true,
      key: 'a',
    });
    this.keyPress.nativeElement.dispatchEvent(event);
  }

  searchUser(searchValue: string) {
    this.searchResult = this.channelUsers.filter((el) => {
      return el.fullName.toLowerCase().includes(searchValue.toLocaleLowerCase());
    });
    if (this.searchResult.length <= 1) {
      this.searchMarktUsers = false;
      // this.addToMsg(this.searchResult[0].fullName)
    }
  }

  /**
   * Displays content relevant to market users based on the provided event.
   *
   * @param {any} event - The event triggering the display of market user content.
   */
  showForMarkt(event: any) {
    let currentValue: string = this.message.trim();
    this.lastIndexOfAt = currentValue.lastIndexOf('@');
    if (this.lastIndexOfAt !== -1) {
      const textNachLetztemAt = currentValue.substring(this.lastIndexOfAt + 1);
      this.searchUser(textNachLetztemAt);
    }
  }

  /**
   * Adds a specified name to the message content.
   *
   * @param {string} name - The name to be added to the message.
  */
  addToMsg(name: string) {
    const textToAdd = this.message.substring(0, this.lastIndexOfAt + 1);
    this.message = `${textToAdd}` + `${name}`;
    this.searchMarktUsers = false;
    this.setCursor();
  }


  /**
   * Event listener for the 'input' event that triggers when the user types in a textarea.
   * Checks for the '@' character or '@' preceded by a newline character and activates the
   * search for market users accordingly.
   *
   * @param {Event} event - The input event object.
   */

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;
    const cursorIndex = textarea.selectionStart;
    this.setCursor()
    // Check if the '@' character is typed or '@' preceded by a newline character.
    if (text.charAt(cursorIndex - 1) === '@' || (text.charAt(cursorIndex - 2) === '\n' && text.charAt(cursorIndex - 1) === '@')) {
      this.activateSearchMarketUsers();
    }
    const atPosition = text.lastIndexOf('@');
    if (atPosition === -1) {
      this.searchMarktUsers = false;
    } else if (atPosition !== this.lastAtPosition) {
      this.searchMarktUsers = true;
    }
    this.lastAtPosition = atPosition;
  }

  /**
   * Sets the cursor position in a textarea element to the end of the content.
   */
  setCursor() {
    const textarea: HTMLTextAreaElement = this.keyPress.nativeElement;
    if (textarea) {
      let lengthOFtext = this.message.length
      textarea.focus(); // Fokus auf das Textfeld setzen
      textarea.setSelectionRange(lengthOFtext, lengthOFtext); // Cursorposition anpassen
    }
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
  
    

openThread(threadId:string) {
  this.router.navigate([this.channelId, "thread", threadId]);
}

checkForPDF() {
  let name:string = this.editorService.fileName;
  let splitedName: string[] = name.split('.');
  let lastPc: string = splitedName[splitedName.length - 1];
  return lastPc
}

}

