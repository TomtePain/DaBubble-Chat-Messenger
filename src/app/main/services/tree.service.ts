import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
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

  constructor(public dialog: MatDialog, private firestore: Firestore, public router: Router, private userservice: UserService, private crud: CrudService) { }
  clickedTop: boolean = false;
  clickedBottom: boolean = false;
  userChannels: any = [];
  userMessages: any = [];
  currentUserDbId = this.userservice.userDBId;
  currentSelectedChannel: string | null = null;
  isSearchActive = false;
  isNewMessage = false;
  isOwnChannel:boolean = false;
  allChannels: Array<any> = [];

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


  openAddChannelDialog() {
    this.dialog.open(DialogAddChannelComponent, {
      data: {
        channels: this.allChannels
      }
    });
  }


  async routeToDmChannel(selectedNode: any) {
    if (selectedNode.id === this.currentUserDbId) {
      this.routeToOwnDM();
      this.currentSelectedChannel = selectedNode.id;
      return;
    }else {
      this.isOwnChannel = false;
    }

    // Query for channels that contain both IDs and are type "message"
    const channelsRef = collection(this.firestore, environment.channelDb);
    const selectedNodeChannelsSnapshot = await getDocs(
      query(
        channelsRef,
        where('ids', 'array-contains', selectedNode.id),
        where('type', '==', 'message')
      )
    );
  
    const currentUserChannelsSnapshot = await getDocs(
      query(
        channelsRef,
        where('ids', 'array-contains', this.currentUserDbId),
        where('type', '==', 'message')
      )
    );
  
    const selectedNodeDMChannels:any = [];
    const currentUserDMChannels:any = [];
  
    selectedNodeChannelsSnapshot.forEach((doc) => {
      selectedNodeDMChannels.push({ id: doc.id, ... doc.data() });
    });
  
    currentUserChannelsSnapshot.forEach((doc) => {
      currentUserDMChannels.push({ id: doc.id, ... doc.data() });
    });
  
    // Find the intersection of the two sets of documents
    const commonDMChannels = selectedNodeDMChannels.filter((doc1:any) =>
    currentUserDMChannels.some((doc2:any) => doc1.id === doc2.id)
    );
    if (commonDMChannels.length > 0) {
      const fullDocument = commonDMChannels[0]; // Assuming you only want the first matching document
      this.handleNodeClick(fullDocument);
    } else {
      this.createNewDm(selectedNode.id);
    }
  }
  

  createNewDm(id: string) {
    const DM = {
      ids: [id, this.userservice.userDBId],
      type: 'message',
      own: this.isOwnChannel
    };
    this.crud.addItem(DM, environment.channelDb).then((docRef) => {
      this.router.navigate(['/', docRef.id]);
      this.currentSelectedChannel = id;
      this.isSearchActive = false;
    }).catch((error) => {
      console.error('Error creating DM:', error);
    });
  }


  createOwnDM(docRef: any) {
    const DM = {
      ids: [docRef.id],
      type: 'message',
      own: true
    };
    this.crud.addItem(DM, environment.channelDb)
  }


  routeToOwnDM() {
    this.crud.getItem(environment.channelDb).subscribe((channel) => {
      let ownMessage = channel.find((exist: { ids: string | null; }) => exist.ids == this.currentUserDbId)
      this.router.navigate(['/', ownMessage.id]);
      // this.currentSelectedChannel = SUCHE NACH this.currentUserDbId in Users Channel und return doc.id;
    })
  }


  handleNodeClick(selectedNode: any) {
    this.isNewMessage = false;
    if (selectedNode.id === 'add') {
      this.openAddChannelDialog();
    }
    if (selectedNode.type == 'message') {
      const directMessagePartnerUserId = selectedNode.ids.find((id:string) => id !== this.currentUserDbId);
      // this.currentSelectedChannel = SUCHE NACH directMessagePartnerUserId in Users Channel und return doc.id;;
      this.router.navigate(['/', selectedNode.id]);
    }
    else if (selectedNode.type == 'channel') {
      this.currentSelectedChannel = selectedNode.id;
      this.router.navigate(['/', selectedNode.id]);
    } 
    this.isSearchActive = false;
    this.isNewMessage = false;
  }
}