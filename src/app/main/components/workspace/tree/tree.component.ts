import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CrudService } from 'src/app/main/services/crud.service';
import { ChannelNode, ExampleFlatNode, MessageNode } from './tree';
import { TreeService } from 'src/app/main/services/tree.service';
import { Firestore, collection, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';
import { catchError } from 'rxjs';
import { UserService } from 'src/app/main/services/user.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length >= 0,
      name: node.name,
      id: node.id,
      img: node.img,
      type:node.type,
      isOnline: node.isOnline,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children as ExampleFlatNode[],
  );

  channelSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  messagesSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


  constructor(private router: Router, public crud: CrudService, public tree: TreeService, private firestore: Firestore, private userid: UserService) {

  }
  
  dbMessages: any[] = [];
  dbChannels: { name: string, type: string, id: string, img: string, ids: any[] }[] = [];
  user = [];
  uid = this.userid.userDBId;
  userDmData: any = [];
  dmUserId = '';
  dmIds = [];
  collection2 = environment.userDb;

  channelRef = query(
    collection(this.firestore, environment.channelDb),
    where('type', 'in', ['channel', 'message']),
    where('ids', 'array-contains', this.uid)
  );


  ngOnInit(): void {
    this.getChannels();
  }


  getChannels() {
    const unsubscribe = onSnapshot(this.channelRef, (querySnapshot) => {
      const result = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data['type'],
          name: data['name'],
          img: data['img'],
          ids: data['ids']
        };
      });
      this.filterType(result);
    });
  }


  filterType(result: any) {
    const channels = result.filter((item: any) => item.type === 'channel');
    const messages = result.filter((item: any) => item.type === 'message');
    this.findUsersFromMessageId(messages);
    this.tree.userChannels = channels;
    this.dbChannels = channels;
    this.dmIds = messages;
    this.updateChannels();
    this.treeControl.expandAll();
  }


  findUsersFromMessageId(messages: any) {
    messages.forEach((message: any) => {
      if (message.ids && Array.isArray(message.ids)) {
        const idsNotMatchingUid = message.ids.filter((id: any) => id !== this.uid);
        this.userDmData.push(...idsNotMatchingUid);
        // //////////////////////////////////////////////////// ADDED 
        let idIsUID = message.ids.filter((id: any) => id == this.uid);
        this.userDmData.push(...idIsUID)
        // //////////////////////////////////////////////////// ADDED 
      }
    });
    this.getUsers();
  }


  async getUsers() {
    const userRef = collection(this.firestore, environment.userDb);

    const querySnapshot = await getDocs(userRef); // Use getDocs to fetch data once

    const filteredDocs = querySnapshot.docs.filter((doc) => {
      const docId = doc.id;
      return this.userDmData.includes(docId);
    });

    this.dbMessages = filteredDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Store the document ID as id
        fullName: data['fullName'],
        photoURL: data['photoURL'],
        uid: data['uid'],
        type: data['type'],
        isOnline: data['isOnline'],
      };
    });
    this.updateMessages();
  }


  updateMessages() {
    const updatedMessages = [
      {
        name: 'Direktnachrichten',
        children: this.dbMessages.map((message) => ({
          id: message.id, // Use the document ID as message.id
          name: message.fullName,
          img: message.photoURL,
          uid: message.uid,
          type:message.type,
          isOnline: message.isOnline,
        })),
      },
    ];
    this.messagesSource.data = updatedMessages as any[];
    this.treeControl.expandAll();
  }


  updateChannels() {
    const updatedChannels = [
      {
        name: 'Channels',
        children: [
        ...this.dbChannels.map
          (channel => ({
             id: channel.id, name: channel.name, img: channel.img,type:channel.type })),
        { name: 'add channels', img: 'assets/workspace-images/add_circle.svg', id: 'add' }]
      }
    ];
    this.channelSource.data = updatedChannels as ChannelNode[];
    this.treeControl.expandAll();
  }


  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;



}