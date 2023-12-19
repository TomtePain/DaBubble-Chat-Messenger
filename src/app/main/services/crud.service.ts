import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private firestore: Firestore) { }

  addItem(item: any, path: any) {
    const itemRef = collection(this.firestore, path);
    return addDoc(itemRef, item);
  }

  getItem(path: any): Observable<any> {
    const itemRef = collection(this.firestore, path);
    return collectionData(itemRef, { idField: 'id' }) as Observable<any>;
  }

  getSpecificItem(path: any, docId: string) {
    const itemRef = collection(this.firestore, path);
    return doc(collection(this.firestore, path), docId);
  }

  getDocument(path: string): Observable<any> {
    const docRef = doc(this.firestore, path);
    return docData(docRef, { idField: 'id' }) as Observable<any>;
  }

  deleteItem(path: any) {
    const itemRef = doc(this.firestore, path);
    return deleteDoc(itemRef);
  }

  updateItem(item: any, path: any) {
    const itemRef = doc(this.firestore, path);
    return setDoc(itemRef, item);
  }

  
}
