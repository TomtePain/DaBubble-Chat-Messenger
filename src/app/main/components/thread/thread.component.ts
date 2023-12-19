import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { CrudService } from '../../services/crud.service';
import { environment } from 'src/environments/environment';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { ReactionService } from '../../services/reaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})

export class ThreadComponent implements OnInit, OnChanges {
  threadData: any;
  channelId!: string;
  threadId!: string;
  startMessageData$!: Observable<any>;
  startMessageData: any;
  allMessages: Array<any> = [];
  sortedReactionTypes!: Array<string>;
  staticReactionTypes!: Array<string>;
  mainMessageId!: string;
  channelName!: string;
  private routeSub: Subscription | undefined;
  private destroy$ = new Subject<void>();
  isNew!: boolean;

  constructor(public firestore: Firestore, public crud: CrudService, private reactionservice: ReactionService, private route: ActivatedRoute, private router: Router, private refreshService: RefreshService) {
  }

  ngOnInit(): void {
    this.refreshService.refreshObservable.subscribe(() => {
      this.refreshData();
    });
    this.staticReactionTypes = this.reactionservice.staticReactionTypes;
    this.sortedReactionTypes = this.reactionservice.sortedReactionTypes;
    this.channelId = this.route.parent?.snapshot.paramMap.get('id') as string;
        
    this.getCurrentChannelInfo();
    this.loadThreadContent()
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['threadId']) {
    if (changes['thread/id']) {  /// CHANGED BY TOM
      this.getThreadMessages();
      setTimeout(() => {
        this.scrollToBottom();
      }, 1000)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.routeSub?.unsubscribe();
  }

  refreshData() {
    this.loadThreadContent();
  }

  loadThreadContent() {
    // Subscribe to Route URL Segments: Use this.route.url.subscribe() to listen for changes in the URL segments. The map(segment => segment.path) extracts the path string from each segment.
    this.routeSub = this.route.url.subscribe(segments => {
      // Get the current route URL segments.
      const pathSegments = segments.map(segment => segment.path);
      // Determine if the current thread is new.
      const isNew = pathSegments.includes('newthread');
      this.isNew = isNew;
      // Load the appropriate content based on whether the thread is new or not.
      if (isNew) {
        // When 'new' is present, use the last segment as threadId
        this.mainMessageId = pathSegments[pathSegments.length - 1];
        this.loadStartMessage(this.mainMessageId);
      } else {
        // When 'new' is not present, use the existing logic
        // this.threadId = this.route.snapshot.paramMap.get('threadId') as string; 
        this.threadId = this.route.snapshot.paramMap.get('id') as string;  ///// CHANGED BY TOM
        this.loadThreadMainMessage();
        this.getThreadMessages();
      }
    });
  }

  getCurrentChannelInfo() {
    let channel = [];
    this.crud.getItem(environment.channelDb).subscribe((allChannels) => {
      channel = allChannels.find((exist: any) => exist.id == this.channelId);
      this.channelName = channel.name;
    });

  }

  getThreadMessages() {
    let path = environment.threadDb + '/' + this.threadId + '/' + 'messages'
    const threadMessagesCollection = collection(this.firestore, path);
    this.crud.getItem(path)
      .pipe(takeUntil(this.destroy$))
      // This operator will complete the observable when the destroy$ Subject emits a value. This is important because it prevents memory leaks.
      .subscribe(allThreadMessages => {
        this.allMessages = allThreadMessages;
        this.sortMessages(this.allMessages)
      });
      
  }

  sortMessages(messages: Array<any>) {
    messages = messages.sort((a, b) => {
      if (a.timestamp < b.timestamp) { return -1 }
      if (a.timestamp > b.timestamp) { return 1 }
      return 0
    });
  }

  scrollToBottom(): void {
    let anchor: any = document.getElementById('anchor-thread');
    anchor.scrollIntoView({ behavior: "smooth" });
  }

  closeThread(): void {
    this.router.navigate([this.channelId]);
    this.destroy$;
  }

  loadStartMessage(input: string) {
    let messageId = input;
    let path = environment.channelDb + '/' + this.channelId + '/' + 'messages' + '/' + messageId;
    this.startMessageData$ = this.crud.getDocument(path);
  }

  loadThreadMainMessage() {
    let path = environment.threadDb + '/' + this.threadId;

    this.crud.getDocument(path)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(
        (message: any) => {
          // console.log("Received message:", message);
          if (message && message.mainMessage) {
            this.loadStartMessage(message.mainMessage);
          } else {
            console.warn("Message is undefined or does not contain a mainMessage property");
          }
        });
  }

}
