import { Injectable } from '@angular/core';
import { DocumentData, DocumentSnapshot, Firestore, doc, docData, getDoc } from '@angular/fire/firestore';
import { UserProfile } from 'src/app/interfaces/user-profile';
import { environment } from 'src/environments/environment';
import { Storage, getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { File } from '../interfaces/editor';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  usersId!: Array<string>;
  usersData: Array<UserProfile> = [];
  fileUrl: string = '';

  constructor(private firestore: Firestore, private storage: Storage) { }

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

  uploadData(file: any) {
    const storageRef = ref(this.storage, '/upload/test/' + file.name);
    const uploadTask = from(uploadBytes(storageRef, file));
    uploadTask.subscribe(() => {
      getDownloadURL(storageRef).then(resp => {
        this.fileUrl = resp;
      }
      )
    })
  }
}
