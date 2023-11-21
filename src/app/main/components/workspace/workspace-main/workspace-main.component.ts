import { Component, HostListener } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { UserService } from 'src/app/main/services/user.service';

@Component({
  selector: 'app-workspace-main',
  templateUrl: './workspace-main.component.html',
  styleUrls: ['./workspace-main.component.scss'],
})
export class WorkspaceMainComponent {
  workspace: boolean = true;
  smallerDesktopWidth = 1570;
  // channelPath = `MSuser/${this.userservice.userDBId}/channel`;
  // channelItem = {
  //   name: 'neuer Channel',
  //   messages: [],
  // };

  

  constructor(
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService,
    private userservice: UserService
  ) {}

  ngOnInit() {
    this.updateWorkspaceState(window.innerWidth);
  }

  //When the window is resized the innerWidth of the window is used to check if it is smaller than the smallerDesktopWidth. If it is smaller the workspace is set to false, so that the channel navigation gets hidden.
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateWorkspaceState(window.innerWidth);
  }

  toggleWorkspace() {
    this.workspace = !this.workspace;
  }

  createNewMessage() {
    this.tree.newMessage = true;
  }

  updateWorkspaceState(width: number) {
    this.workspace = width > this.smallerDesktopWidth;
  }
}


