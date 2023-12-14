import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { environment } from 'src/environments/environment';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { from } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  usersId!: Array<string>;
  usersData: Array<UserProfile> = [];
  fileUrl: string = '';
  fileName: string = '';
  newFileName: string = '';

  constructor(private firestore: Firestore, private storage: Storage, private userservice: UserService) { }

  /**
   * Retrieves and populates user data for a single document identified by 'docId' from Firestore.
   *
   * @param {string} docId - The ID of the document to retrieve data 
   */
  async subSingelData(docId: string) {
    try {
      // Retrieve data from Firestore for the specified document.
      const docSnapshot = await getDoc(
        doc(this.firestore, `${environment.channelDb}/${docId}`)
      );

      // Extract the 'ids' field from the document data.
      const reps = docSnapshot.data() as { ids: string[] };

      if (reps) {
        this.usersId = reps.ids;

        // Iterate through the retrieved user IDs and fetch individual user data.
        for (let i = 0; i < this.usersId.length; i++) {
          const uid = this.usersId[i];

          // Retrieve user data for the current user ID.
          const userDataSnapshot = await getDoc(
            doc(this.firestore, environment.userDb, uid)
          );

          // Convert and append the user data to the 'usersData' array.
          const userData = userDataSnapshot.data() as UserProfile;
          if (userData) {
            this.usersData.push(userData);
          }
        }
      }
    } catch (error) {
      // Handle any potential errors that may occur during the data retrieval process.
      console.error('An error occurred while fetching user data:', error);
    }
  }

  uploadDataToStore(file: any) {
    const storageRef = ref(this.storage, `/upload/${this.userservice.userDBId}/` + this.newFileName);
    const uploadTask = from(uploadBytes(storageRef, file));
    uploadTask.subscribe(() => {
      getDownloadURL(storageRef).then(resp => {
        this.fileUrl = resp;
        this.fileName = this.newFileName;
      })
    })
  }


  uploadData(file: any) {
    let counter = this.userservice.loginUser.uploadFileCounter;
    counter++;
    this.updateUploadCounter(counter);
    this.newFileName = counter + '-' + file.name;
    this.uploadDataToStore(file);
  }

  updateUploadCounter(counter:number) {
    const docInstance = doc(this.firestore, environment.userDb, this.userservice.userDBId as string);
    let updateCounter = {
      uploadFileCounter : counter
    };
    updateDoc(docInstance, updateCounter);
  }

  messageToSearchTerms(sentence: string): string[] {
    const messageWordsOnly = sentence.trim().replace(/[^\p{L}\p{N}\s]/gu, "");
    console.log("messageWordsOnly", messageWordsOnly);
    
    const messageLowerCase = messageWordsOnly.toLowerCase();
    console.log("messageLowerCase", messageLowerCase);
    const regex = /\s+/;
    let array = sentence.split(regex).filter(word => word.length > 0).map(word => word.toLowerCase());;
    array.push(messageLowerCase);
    console.log("Array", array);
    
    return array;
  }
  
  messageToLowercase(message: string) {
    const messageLowercase = message.toLowerCase();
    return messageLowercase;
  }


}