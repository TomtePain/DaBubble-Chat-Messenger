import { Injectable } from '@angular/core';
import { collection, doc, DocumentData, Firestore, getDoc, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogAddChannelComponent } from '../components/workspace/dialog-add-channel/dialog-add-channel.component';
import { CrudService } from './crud.service';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor(public dialog: MatDialog, private firestore: Firestore, public router: Router, private user: UserService, private crud: CrudService) { }
  clickedTop: boolean = false;
  clickedBottom: boolean = false;
  userChannels: any = [];
  userMessages: any = [];
  uid = this.user.userDBId;
  currentSelectedChannel: string | null = null;
  own = false;
  search = false;
  newMessage = false;

  changeArrow(id: string, isTopArrow: boolean) {

    const element = document.querySelector(`#${id}`) as HTMLImageElement | null;
    if (element) {
      element.style.rotate = isTopArrow
        ? this.clickedTop
          ? '0deg'
          : '-90deg'
        : this.clickedBottom
          ? '0deg'
          : '-90deg';
    }
    if (isTopArrow) {
      this.clickedTop = !this.clickedTop;
    } else {
      this.clickedBottom = !this.clickedBottom;
    }
  }

  arrow(id: string,) {
    const element = document.querySelector(`#${id}`) as HTMLImageElement | null;
    if (element) {
      element.style.rotate = '90deg'

    }
  }

  openDialog() {
    this.dialog.open(DialogAddChannelComponent);
  }

  async routeToDmChannel(node: any) {
    if (node.id === this.uid) {
      console.log('Messaging oneself');
      this.own = true;
      // return;
    } else {
      this.own = false
    }
  
    const dmChannelsRef = collection(this.firestore, environment.channelDb);
    const querySnapshot1 = await getDocs(
      query(
        dmChannelsRef,
        where('ids', 'array-contains', node.id),
        where('type', '==', 'message')
      )
    );
  
    const querySnapshot2 = await getDocs(
      query(
        dmChannelsRef,
        where('ids', 'array-contains', this.uid),
        where('type', '==', 'message')
      )
    );
  
    const matchingDocs1:any = [];
    const matchingDocs2:any = [];
  
    querySnapshot1.forEach((doc) => {
      matchingDocs1.push({ id: doc.id, ... doc.data() });
    });
  
    querySnapshot2.forEach((doc) => {
      matchingDocs2.push({ id: doc.id, ... doc.data() });
    });
  
    // Find the intersection of the two sets of documents
    const matchingDocs = matchingDocs1.filter((doc1:any) =>
      matchingDocs2.some((doc2:any) => doc1.id === doc2.id)
    );
    if (matchingDocs.length > 0) {
      const fullDocument = matchingDocs[0]; // Assuming you only want the first matching document
      this.handleNodeClick(fullDocument);
    } else {
      this.createNewDm(node.id);
    }
  }
  



  createNewDm(id: string) {
    const DM = {
      ids: [id, this.user.userDBId],
      type: 'message',
      own: this.own
    };
    // debugger
    this.crud.addItem(DM, environment.channelDb).then((docRef) => {
      // debugger
      this.router.navigate(['/', docRef.id]);
      this.currentSelectedChannel = id;
      this.search = false;
    }).catch((error) => {
      console.error('Error creating DM:', error);
    });
  }


  handleNodeClick(node: any) {
    this.newMessage = false;
    if (node.id === 'add') {
      this.openDialog();
    }
    if (node.type == 'message') {
      const otherUserId = node.ids.find((id:string) => id !== this.uid);
      this.currentSelectedChannel = otherUserId;
      this.router.navigate(['/', node.id]);
    }
    else if (node.type == 'channel') {
      this.currentSelectedChannel = node.id;
      this.router.navigate(['/', node.id]);
    } 
    this.search = false;
    this.newMessage = false;
  }



}