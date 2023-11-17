import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CrudService } from '../../services/crud.service';
import { ReactionService } from '../../services/reaction.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reaction',
  templateUrl: './reaction.component.html',
  styleUrls: ['./reaction.component.scss'],
})
export class ReactionComponent {
  @Input() reactionData: any;
  @Input() reactionTimestamps: any;
  @Input() messageId: any;
  @Input() channelID!: string;
  @Input() threadId!: string;
  allUserDataInfo: Array<any> = this.userservice.allUsers;
  sortedReactions: any[] = [];
  sortedReactionUserNamesModified: string[] = [];
  currentUser!:string;
  currentUserDefaultString: string = 'Du';
  reactionUserListMaximum: number = 3;
  private fetchAllUserDataSubscription!: Subscription;

  constructor(
    public reactionservice: ReactionService,
    public crud: CrudService,
    public userservice: UserService
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    // fetch AllUserData onInit to avoid calling them multiple times
      this.sortReactions();
  }

  ngOnDestroy() {
    //Cleaning up the component to avoid memory leaks
    this.fetchAllUserDataSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reactionData'] && !changes['reactionData'].firstChange) {
      this.reactionData = changes['reactionData'].currentValue ;
      this.sortReactions();
    }
  }

  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  toggleReaction(type: string, messageId: string, reactionData: any) {
    if (this.channelID && this.threadId === undefined) {
      this.reactionservice.toggleReaction(
        type,
        messageId,
        reactionData,
        'channel',
        this.channelID
      );
    } 
    else if (this.channelID && this.threadId) {
      this.reactionservice.toggleReaction(
        type,
        messageId,
        reactionData,
        'thread',
        this.threadId
      );
    }
    else {
      console.warn("Channel ID", this.channelID, 'does not exists', this.threadId)
    }
  }

  async sortReactions() {
    let combinedData = [];
    for (const key in this.reactionData) {
      const userIdsForReaction = this.reactionData[key];
      const userNamesForReaction = userIdsForReaction.map((id: string) =>
        this.getFullNameFromUserId(id)
      );

      combinedData.push({
        reaction: key,
        userIds: userIdsForReaction,
        userNames: userNamesForReaction.join(', '), // Create a string with all full names and separate them with a , and a space.
        earliestTimestamp: this.reactionTimestamps[key],
      });
    }

    combinedData.sort((a, b) => a.earliestTimestamp - b.earliestTimestamp);
    this.sortedReactions = combinedData;

  }

  getFullNameFromUserId(userID: string): string | undefined {
    const existUser = this.allUserDataInfo.find(
      (exist: any) => exist.id === userID
    );
    // console.log(existUser.id);
    

    if (existUser.id != this.currentUser) {
      return existUser.fullName;
    } else if(existUser.id === this.currentUser) {
      return this.currentUserDefaultString;
    } else {
      console.warn(`User with ID ${userID} not found!`);
      return undefined;
    }
  }

  fetchAllUserData() {
    return this.crud.getItem(environment.userDb);
  }

  getCurrentUser() {
    let localStorageItem = localStorage.getItem('userId') as string;
    this.currentUser = localStorageItem;
  }

  removeCurrentUserFromArray(userNames: string) {
   let str = userNames;
   if (str.includes(this.currentUserDefaultString)) {
       // Remove the target patterns using a regular expression
       let regex = new RegExp(`\\b${this.currentUserDefaultString}\\b\\s*,?|,\\s*\\b${this.currentUserDefaultString}\\b`, 'g');
       str = str.replace(regex, "").trim();
   }

   return str;
}

}
