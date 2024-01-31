import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CrudService } from 'src/app/main/services/crud.service';
import { ChannelNode, ExampleFlatNode } from './tree';
import { TreeService } from 'src/app/main/services/tree.service';
import { Firestore, collection, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';
import { UserService } from 'src/app/main/services/user.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RefreshService } from 'src/app/main/services/refresh.service';


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


  constructor(private router: Router, public activatedRoute: ActivatedRoute, public crud: CrudService, public tree: TreeService, private firestore: Firestore, private userservice: UserService, private refreshService: RefreshService) {
  }
  
  dbMessages: any[] = [];
  dbChannels: { name: string, type: string, id: string, img: string, ids: any[] }[] = [];
  user = [];
  currentUserDbId = this.userservice.userDBId;
  userDmData: any = [];
  dmUserId = '';
  dmIds = [];
  selectedChannel: string | null = null; // Initialized to null;
  currentRouteId: string | null = null; // Initialized to null
  channelRef = query(
    collection(this.firestore, environment.channelDb),
    where('type', 'in', ['channel', 'message']),
    where('ids', 'array-contains', this.currentUserDbId)
  );


  ngOnInit(): void {
  this.subscribeToRouteChanges();
  this.refreshService.refreshObservable.subscribe(() => {
    this.refreshData();
  });

  this.getChannels();
  this.selectTreeNode();  
  }

  selectTreeNode() {
  this.currentRouteId = this.getCurrentRouteChannelId();  

  this.getCurrentSelectedChannel(this.currentRouteId, (selectedChannel: string | null) => {
    this.tree.currentSelectedChannel = selectedChannel;
  });
  }


  // Asynchronously fetches the selected channel based on the current route. Updates this.selectedChannel with the result once obtained. Note that other code in ngOnInit continues executing and does not wait for this update.
  getCurrentSelectedChannel(currentRoute: string, callback: (selectedChannel: string | null) => void) {
  // Fetch all channels and find the one matching currentRoute
  this.crud.getItem(environment.channelDb).subscribe((resp) => {
    let allChannels = resp;
    const currentChannel = allChannels.find((channel: any) => channel.id === currentRoute);

    this.selectedChannel = this.setSelectedChannel(currentChannel, currentRoute);
    callback(this.selectedChannel);
  });
  }


  // Determine the appropriate selected channel based on the channel's type and properties.
  setSelectedChannel(currentChannel: any, currentRoute: string) {
    if (currentChannel) {
      // Check if it is an "own" direct messages chat classified and return the currentUserDBId. If it is not an "own" channel find the userId in currentChannel.ids that is not the currentUsersDbId
      if (currentChannel.type === 'message') {
        return currentChannel.own ? this.currentUserDbId : currentChannel.ids.find((id: string) => id !== this.currentUserDbId);
    } // Use currentRoute for non-'message' type channels
      else {
        return currentRoute;
    }
  }
  }


  refreshData() {
    this.getChannels();
  }


  subscribeToRouteChanges(): void {
    this.router.events.subscribe(event => {
      
      // As soon as the navigation process ended the selected channel will be updated with the currentRoute's ChannelId
      if (event instanceof NavigationEnd) {
        const currentRouteId = this.getCurrentRouteChannelId();
        this.getCurrentSelectedChannel(currentRouteId, (selectedChannel) => {
          this.tree.currentSelectedChannel = selectedChannel;
        });
      }
    });
  }


  getCurrentRouteChannelId(): string {
    // Extract the current route ID from the URL. Make sure that the url segments 2nd position is always taken for the node selection
    const urlSegments = this.router.url.split('/');
    return urlSegments[1];
  }


  isSelected(nodeId: string): boolean {   
    return this.tree.currentSelectedChannel === nodeId;;
  }

  // Get all channels from databse
  getChannels() {
    onSnapshot(this.channelRef, (querySnapshot) => {
      const result = querySnapshot.docs.map((doc) => {
        const data = doc.data();        
        return {
          id: doc.id,
          type: data['type'],
          name: data['name'],
          img: data['img'],
          ids: data['ids'],
          own: data['own']
        };
      });   
      this.filterType(result);
    });
  }

// Filter all channels for their type (if they are a real channel or a direct messages channel). Then
  filterType(result: any) {
    const channels = result.filter((item: any) => item.type === 'channel');
    const messages = result.filter((item: any) => item.type === 'message');

    this.findUserDocsIdsFromDirectMessageId(messages);
    this.getUsers();


    this.tree.userChannels = channels;
    this.dbChannels = channels;
    this.tree.allChannels = channels;    
    this.updateChannels();
    this.treeControl.expandAll();
  }


  findUserDocsIdsFromDirectMessageId(messages: any) {    
    messages.forEach((message: any) => {
      if (message.ids && Array.isArray(message.ids)) {
        const idsNotMatchingUid = message.ids.filter((id: any) => id !== this.currentUserDbId);
        this.userDmData.push(...idsNotMatchingUid);
        const idIsUID = message.ids.filter((id: any) => id == this.currentUserDbId && message.own && message.ids.length == 1);
        this.userDmData.push(...idIsUID);
      }
    });    
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
      const isOwn = (this.currentUserDbId === doc.id);

        return {
          id: doc.id, // Store the document ID as id
          own: isOwn,
          fullName: data['fullName'],
          photoURL: data['photoURL'],
          uid: data['uid'],
          type: data['type'],
          isOnline: data['isOnline'],
        };
    });

    this.sortDirectMessages();    
    this.updateDirectMessagesChannels();
  }

  sortDirectMessages() {
  // Sort the dbMessages array first by "own" (true comes first), and then by "fullName" in alphabetical order
  this.dbMessages.sort((a, b) => {
    // First, sort by "own" (true comes first)
    if (a.own && !b.own) return -1;
    if (!a.own && b.own) return 1;

  // If "own" is the same, sort by "fullName" alphabetically
  return a.fullName.localeCompare(b.fullName);
});}


  updateDirectMessagesChannels() {  
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