import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  doc,
  DocumentData,
  DocumentReference,
  updateDoc,
} from 'firebase/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
  currentUserId!: string;
  sortedReactionTypes: Array<string> = ['check', 'clap', 'rocket', 'nerd'];
  staticReactionTypes: Array<string> = ['check', 'clap', 'rocket', 'nerd'];

  constructor(public firestore: Firestore) {
    this.checkUserIdIsString();
    this.loadLastUsedReactionTypes();
  }

  toggleReaction(type: string, messageId: string, reactionData: any, channelType: string, documentID: string) {
    let docInstance: DocumentReference<DocumentData> = this.checkChannelType(
      channelType,
      documentID,
      messageId
    );

    if (!reactionData) {
      reactionData = {};
    }

    // Ensure we have an array for the specific reaction type
    if (!reactionData[type]) {
      reactionData[type] = [];
    }

    const usersForReaction = reactionData[type];

    if (usersForReaction.includes(this.currentUserId)) {
      this.removeUserFromReaction(type, docInstance, usersForReaction);
    } else {
      this.addUserToReaction(type, docInstance, usersForReaction);
      this.moveReactionToFront(type);
      this.saveLastUsedReactionTypes(this.sortedReactionTypes);
    }
  }

  addUserToReaction(
    type: string,
    docInstance: DocumentReference,
    existingUsers: Array<string>
  ) {
    const updatedUsers = [...existingUsers, this.currentUserId];
    const updateUsers = {
      [`reaction.${type}`]: updatedUsers,
    };
    this.updateDataInDb(docInstance, updateUsers);

    if (existingUsers.length === 0) {
      const timestamp = new Date();
      const timeStamp = {
        [`reactionsTime.${type}`]: timestamp.getTime(),
      };
      this.updateDataInDb(docInstance, timeStamp);
    }
  }

  removeUserFromReaction(
    type: string,
    docInstance: DocumentReference,
    existingUsers: Array<string>
  ) {
    const updatedUsers = existingUsers.filter(
      (user) => user !== this.currentUserId
    );
    const updateUsers = {
      [`reaction.${type}`]: updatedUsers.length > 0 ? updatedUsers : [], // Uses an empty array if no users left
    };
    this.updateDataInDb(docInstance, updateUsers);
  }

  updateDataInDb(docInstance: DocumentReference, updatedData: any) {
    updateDoc(docInstance, updatedData)
      .catch((err) => {
        console.error(err);
      });
  }

  checkUserIdIsString() {
    const userId = localStorage.getItem('userId');
    if (typeof userId === 'string') {
      this.currentUserId = userId;
    } else {
      console.error('UserId is not a string');
    }
  }

  saveLastUsedReactionTypes(array: Array<string>) {
    let sortedReactionsAsJSON = JSON.stringify(array);
    localStorage.setItem('sortedReactions', sortedReactionsAsJSON);
  }

  loadLastUsedReactionTypes() {
    let localStorageItem = localStorage.getItem('sortedReactions') as string;
    let storedReactionArray = JSON.parse(localStorageItem);

    if (storedReactionArray === null) {
      this.sortedReactionTypes = this.staticReactionTypes;
    } else {
      this.sortedReactionTypes = storedReactionArray;
    }
  }

  moveReactionToFront(storedReaction: string): void {
    this.sortedReactionTypes = this.staticReactionTypes;
    //Make sure reaction type is a known type in static reactions
    if (this.staticReactionTypes.includes(storedReaction)) {
      const index = this.sortedReactionTypes.indexOf(storedReaction);

      if (index > -1) {
        this.sortedReactionTypes.splice(index, 1);
      }
      this.sortedReactionTypes.unshift(storedReaction);
    } else {
      console.warn(storedReaction, 'is not part of staticReactionTypes');
    }
  }

  checkChannelType(channelType: string, documentID: string, messageId: string) {
    if (channelType === 'channel') {
      return doc(
        this.firestore,
        environment.channelDb + '/' + documentID + '/' + 'messages',
        messageId
      );
    } else {
      return doc(
        this.firestore,
        environment.threadDb + '/' + documentID + '/' + 'messages',
        messageId
      );
    }
  }
}
