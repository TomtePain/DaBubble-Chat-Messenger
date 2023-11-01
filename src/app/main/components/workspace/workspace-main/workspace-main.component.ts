import { Component } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { UserService } from 'src/app/main/services/user.service';



@Component({
  selector: 'app-workspace-main',
  templateUrl: './workspace-main.component.html',
  styleUrls: ['./workspace-main.component.scss']
})
export class WorkspaceMainComponent {
  constructor(public firestore: Firestore, public crud: CrudService, public tree: TreeService, private user:UserService) {

  }
workspace:boolean=true;
  channelPath = `MSuser/${this.user.userDBId}/channel`;
  channelItem = {
    name: 'neuer Channel',
    messages: []
  }

  toggleWorkspace(){
    this.workspace=!this.workspace;
  }

  createNewMessage(){
    this.tree.newMessage = true;
  }

}


