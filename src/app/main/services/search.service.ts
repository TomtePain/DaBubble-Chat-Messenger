import { Injectable } from '@angular/core';
import { Firestore, query, collection, doc, getDoc, getDocs, where, collectionGroup, or, DocumentData, Query, DocumentSnapshot, and } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { AuthService } from 'src/app/main/services/auth.service';
import { environment } from 'src/environments/environment';
import { CrudService } from './crud.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchResultMessages: any[] = [];
  searchResultChannels: any[] = [];
  searchResultUsers: any[] = [];
  allUserDataInfo: Array<any> = [];
  existingUser: any;
  currentUser: string | null;
  private handleSearchInput = new Subject<string>();
  searchState$ = this.handleSearchInput.asObservable();


  constructor(private firestore: Firestore, private userService: UserService, private auth: AuthService, private crud: CrudService) { 
    this.currentUser = this.userService.userDBId;
  }

  clearSearch() {
    this.handleSearchInput.next('');
  }


async searchChannels(input: string) {
    this.searchResultChannels = []; // clear search results
    const cleanedInput = this.cleanInput(input); // remove any symbols from the input string
    let input_variations = this.getInputVariations(cleanedInput);   

    const matchInputsToChannels = query(collectionGroup(this.firestore, environment.channelDb),
      or(
        where('searchTerms', 'array-contains-any', input_variations), 
        where('name', 'in', input_variations)
      ));

    await this.getChannelsSearchResults(matchInputsToChannels)

    return this.searchResultChannels;
  }


async getChannelsSearchResults(input_variations: Query<DocumentData>) {
  const querySnapshot = await getDocs(input_variations);
  for (const doc of querySnapshot.docs) {
    let searchResultData = doc.data();

    let channel = doc.id;
    this.isCurrentUserIdInChannel(channel).then(isUserInChannel => {
    if (isUserInChannel) {
    const foundChannel = this.getSingleChannelSearchResult(searchResultData, doc.id)
    
    this.searchResultChannels.push(foundChannel);
    }
  })
}
}


async searchUsers(input: string) {
  this.searchResultUsers = []; // clear search results
  const cleanedInput = this.cleanInput(input); // remove any symbols from the input string
  let input_variations = this.getInputVariations(cleanedInput);   

  const matchInputsToUsers = query(collectionGroup(this.firestore, environment.userDb),
    or(
      where('searchTerms', 'array-contains-any', input_variations), 
      where('fullName', 'in', input_variations)
    ));

  await this.getUserSearchResults(matchInputsToUsers)

  return this.searchResultUsers;
}


async getUserSearchResults(input_variations: Query<DocumentData>) {
  const querySnapshot = await getDocs(input_variations);
  for (const doc of querySnapshot.docs) {
    let searchResultData = doc.data();
   
    const foundUser = this.getSingleUserSearchResult(searchResultData, doc.id)
    this.searchResultUsers.push(foundUser);
}
}


async searchMessages(input: string) {
    this.searchResultMessages = []; // clear search results
    const cleanedInput = this.cleanInput(input); // remove any symbols from the input string
    let input_variations = this.getInputVariations(cleanedInput);    
      
    // ? Search query that checks if one of the input variations matches any of the stored searchTerm strings that are stored for each message during the creation or if one of the input variations matches the whole message. "searchTerms", "message" and "messageLowercase" are document fields.
    const matchInputsToMessages = query(collectionGroup(this.firestore, 'messages'), 
    or(
      where('messageLowercase', 'in', input_variations),
      where('searchTerms', 'array-contains-any', input_variations), 
      where('message', 'in', input_variations)
      ));

    await this.getMessagesSearchResults(matchInputsToMessages);

  return this.searchResultMessages;
}


async getMessagesSearchResults(input_variations: Query<DocumentData>) {
  const querySnapshot = await getDocs(input_variations)
  for (const doc of querySnapshot.docs) {
    let searchResultData = doc.data();
    let path = await this.getUrlPath(doc.ref.path) as string;

    //  // !!! Please remove next two steps if direct links from search results to messages are working correctly
    //  let lastSlashIndex = path.lastIndexOf('/');
    //  path = path.substring(0, lastSlashIndex);
    //  // !!! end of help code

    //Only generate a search result if the currentUser has access to the channel the search message is part of. 
    let channel = this.getChannelId(path);   
    this.isCurrentUserIdInChannel(channel).then(isUserInChannel => {
      if (isUserInChannel) {
        const foundMessage = this.getSingleMessageSearchResult(searchResultData, path, doc.id)
        this.searchResultMessages.push(foundMessage);
      } else {
        console.warn('Current user has no access to channel the message is in');
      }
    });
}
}


async getUrlPath(messagePath: string) {
let path = messagePath.split("/");

if (messagePath.startsWith(environment.channelDb)) {
  let url = `/${path[1]}/msg/${path[3]}`;
  return url;
} else if (messagePath.startsWith(environment.threadDb)) {
  let channel = await this.getThreadParentURL(path[1])
  let url = `/${channel}/thread/${path[1]}/${path[3]}`;
  return url;
} else {
  return console.error("Search result path not known");
}
}


getThreadParentURL(threadId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const threadDocRef = doc(this.firestore, environment.threadDb, threadId);
    getDoc(threadDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const mainMessage = docSnap.data()['mainMessage'];
        const channelsCollectionRef = collection(this.firestore, environment.channelDb);
        getDocs(channelsCollectionRef).then(channelsSnapshot => {
          channelsSnapshot.forEach(channelDoc => {
            const messagesCollectionRef = collection(this.firestore, `${environment.channelDb}/${channelDoc.id}/messages`);
            getDocs(messagesCollectionRef).then(messagesSnapshot => {
              messagesSnapshot.forEach(messageDoc => {
                if (messageDoc.id === mainMessage) {
                  resolve(channelDoc.id);  // Resolve the promise with the channel ID
                }});
            }).catch(reject); // Handle errors in inner getDocs messagesCollectionRef
          });
        }).catch(reject); // Handle errors in outer getDocs channelsCollectionRef
      } else {reject('No such document'); // Reject the promise if the document doesn't exist
      }
    }).catch(reject); // Handle errors in getDoc threadDocRef
  });
}


// Fetch the document with the given channelId from the channel database collection. If the document exists, it checks whether the ids field is an array and whether it includes the userId. The function returns true if the userId is found in the ids array, and false otherwise.
async isCurrentUserIdInChannel(channelId: string) {
  const userId = this.currentUser as string
  try { 
    const channelDocRef = doc(this.firestore, environment.channelDb, channelId);
    const channelDocSnap = await getDoc(channelDocRef);

    if (channelDocSnap.exists()) {
      const idsArray = channelDocSnap.data()['ids'];
      if (idsArray && Array.isArray(idsArray)) {
        return idsArray.includes(userId);
      } else {
        console.warn('ids field is not an array or does not exist in the document');
        return false;
      }
    } else {
      console.warn('No such document!');
      return false;
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
    return false;
  }
}


getSingleMessageSearchResult(data: DocumentData, path: string, docId: string) {
  const searchResult = {
    id: docId,
    message: data['message'],
    timestamp: data['timestamp'],
    user: this.getUserFullName(data['user']),
    userProfileImage: this.getUserProfileImage(data['user']),
    path: path
  }
  return searchResult;
}

getSingleChannelSearchResult(data: DocumentData, docId: string) {
  const searchResult = {
    id: docId,
    description: data['description'],
    name: data['name']
  }
  return searchResult;
}


getSingleUserSearchResult(data: DocumentData, docId: string) {
  const searchResult = {
    id: docId,
    fullName: data['fullName'],
    photoURL: data['photoURL']
  }
  return searchResult;
}


getInputVariations(cleanedInput: string) {
  let input_variations = [];
  input_variations.push(cleanedInput)
  input_variations.push(cleanedInput.toLowerCase())
  input_variations.push(cleanedInput.toUpperCase())
  input_variations.push(cleanedInput[0].toUpperCase() + cleanedInput.slice(1));

  return input_variations;
}


getUserFullName(userId: string) {
  this.allUserDataInfo = this.userService.allUsers;
  let existUser = this.allUserDataInfo.find((exist) => exist.id == userId);
  return existUser.fullName;
}


getUserProfileImage(userId: string) {
  this.allUserDataInfo = this.userService.allUsers;
  let existUser = this.allUserDataInfo.find((exist) => exist.id == userId);
  return existUser.photoURL;
}


getChannelId(path: string): string {
  const segments = path.split('/');
  // The first element of the array is an empty string if the path starts with '/', so the second element will be the first part of the path.
  return segments[1];
}

cleanInput(input: string) {
  let cleanedInput = input.trim().replace(/^[^\w]+|[^\w]+$/g, "")
  return cleanedInput;
}

}



