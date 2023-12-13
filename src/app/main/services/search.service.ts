import { Injectable } from '@angular/core';
import { Firestore, query, addDoc, collection, collectionData, deleteDoc, doc, docData, getDoc, getDocs, onSnapshot, setDoc, where, collectionGroup, or } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { CrudService } from './crud.service';


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchResultMessages: any[] = [];
  allUserDataInfo: Array<any> = [];
  existingUser: any;
  currentUser: string | null;

  constructor(private firestore: Firestore, private userService: UserService, private auth: AuthService, private crud: CrudService) { 
    this.currentUser = this.userService.userDBId;
  }



  async searchMessages(input: string) {
    this.searchResultMessages = [];
    let input_variations = [];
    const cleanedInput = input.trim().replace(/^[^\w]+|[^\w]+$/g, "");
    input_variations.push(cleanedInput)
    input_variations.push(cleanedInput.toLowerCase())
    input_variations.push(cleanedInput.toUpperCase())
    input_variations.push(cleanedInput[0].toUpperCase() + cleanedInput.slice(1));


    console.log(input_variations);
    
    //TODO find the optimal query method

    //?Variant that checks if one of the input variations matches the whole message
    // const matchInput = query(collectionGroup(this.firestore, 'messages'), where('message', 'in', input_variations))
    //?Variant that checks if one of the input variations matches any of the stored searchTerm strings that are stored for each message during the creation
    // const matchInput = query(collectionGroup(this.firestore, 'messages'), where('searchTerms', 'array-contains-any', input_variations))
    //?Variant that checks if one of the input variations matches any of the stored searchTerm strings that are stored for each message during the creation or if one of the input variations matches the whole message
    const matchInput = query(collectionGroup(this.firestore, 'messages'), 
    or(
      //? searchTerms, message and messageLowercase are document fields
      where('messageLowercase', 'in', input_variations),
      where('searchTerms', 'array-contains-any', input_variations), 
      where('message', 'in', input_variations)
      )) 

    const querySnapshot = await getDocs(matchInput)
    // console.log(querySnapshot);

    for (const doc of querySnapshot.docs) {
      let searchResult = doc.data();
      let path = await this.getUrlPath(doc.ref.path) as string;

      //! Please remove next two steps if direct links from search results to messages are working correctly
      let lastSlashIndex = path.lastIndexOf('/');
      path = path.substring(0, lastSlashIndex);
      //! end of two steps

      //Only generate a search result if the currentUser has access to the channel the search message is part of. 
      let channel = this.getChannelId(path);   
      // console.log("channel", channel);
      this.isCurrentUserIdInChannel(channel).then(isUserInChannel => {
        if (isUserInChannel) {
          const user = searchResult['user'];
          const foundMessage = {
            id: doc.id,
            message: searchResult['message'],
            timestamp: searchResult['timestamp'],
            user: this.getUserFullName(user),
            userProfileImage: this.getUserProfileImage(user),
            path: path
          }
          this.searchResultMessages.push(foundMessage);
          // console.log(this.searchResultMessages);
        } else {
          console.warn('Current user has no access to channel the message is in');
        }
      });
  }
  return this.searchResultMessages;
}

getThreadParentURL(threadId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const threadDocRef = doc(this.firestore, environment.threadDb, threadId);
    getDoc(threadDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const mainMessage = docSnap.data()['mainMessage'];
        const channelsCollectionRef = collection(this.firestore, 'channel');
        getDocs(channelsCollectionRef).then(channelsSnapshot => {
          channelsSnapshot.forEach(channelDoc => {
            const messagesCollectionRef = collection(this.firestore, `channel/${channelDoc.id}/messages`);

            getDocs(messagesCollectionRef).then(messagesSnapshot => {
              messagesSnapshot.forEach(messageDoc => {
                if (messageDoc.id === mainMessage) {
                  resolve(channelDoc.id);  // Resolve the promise with the channel ID
                }
              });
            }).catch(reject); // Handle errors in inner getDocs messagesCollectionRef
          });
        }).catch(reject); // Handle errors in outer getDocs channelsCollectionRef
      } else {
        reject('No such document'); // Reject the promise if the document doesn't exist
      }
    }).catch(reject); // Handle errors in getDoc threadDocRef
  });
}

async getUrlPath(messagePath: string) {
let path = messagePath.split("/");

if (messagePath.startsWith('channel')) {
  let url = `/${path[1]}/${path[3]}`;
  return url;
} else if (messagePath.startsWith('threads')) {
  let channel = await this.getThreadParentURL(path[1])
  let url = `/${channel}/thread/${path[1]}/${path[3]}`;
  return url;
} else {
  console.log("Search result path not known");
  return console.error();
}
}

async isCurrentUserIdInChannel(channelId: string) {
  const userId = this.currentUser as string
  try {
    const channelDocRef = doc(this.firestore, 'channel', channelId); // Assuming 'channels' is your collection name
    const channelDocSnap = await getDoc(channelDocRef);

    if (channelDocSnap.exists()) {
      const idsArray = channelDocSnap.data()['ids'];
      if (idsArray && Array.isArray(idsArray)) {
        return idsArray.includes(userId);
      } else {
        console.log('ids field is not an array or does not exist in the document');
        return false;
      }
    } else {
      console.log('No such document!');
      return false;
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
    return false;
  }
}

getUserFullName(userId: string) {
  this.allUserDataInfo = this.userService.allUsers;
  let existUser = this.allUserDataInfo.find((exist) => exist.id == userId);
  return existUser.fullName;
}

getUserProfileImage(userId: string) {
  this.allUserDataInfo = this.userService.allUsers;
  let existUser = this.allUserDataInfo.find((exist) => exist.id == userId);
  // console.log("userProfileImage");
  return existUser.photoURL;
}

getChannelId(path: string): string {
  const segments = path.split('/');
  // The first element of the array is an empty string if the path starts with '/',
  // so the second element will be the first part of the path
  return segments[1];
}


}



