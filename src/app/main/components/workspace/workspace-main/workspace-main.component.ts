import { Component, HostListener } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CrudService } from 'src/app/main/services/crud.service';
import { TreeService } from 'src/app/main/services/tree.service';
import { UserService } from 'src/app/main/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-workspace-main',
  templateUrl: './workspace-main.component.html',
  styleUrls: ['./workspace-main.component.scss'],
})
export class WorkspaceMainComponent {
  workspace: boolean = true;
  smallerDesktopWidth = 1570;
  private workspaceState: Subscription;  

  constructor(
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService,
    private userservice: UserService
  ) {
    this.workspaceState = this.tree.workspaceState$.subscribe(value => {
      this.workspace = value;
    });
  }

  ngOnInit() {
    this.updateWorkspaceState(window.innerWidth);
  }

  ngOnDestroy() {
    this.workspaceState.unsubscribe();
  }

  //When the window is resized the innerWidth of the window is used to check if it is smaller than the smallerDesktopWidth. If it is smaller the workspace is set to false, so that the channel navigation gets hidden.
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateWorkspaceState(window.innerWidth);
  }

  toggleWorkspace() {
    this.workspace = !this.workspace;
  }

  closeWorkspace(){
    this.workspace = false;
  } 

  createNewMessage() {
    this.tree.isNewMessage = true;
    if(window.innerWidth < environment.smallerDesktopWidth) {
    this.closeWorkspace()
  }
  }

  updateWorkspaceState(width: number) {
    this.workspace = width > environment.smallerDesktopWidth;
  }
}


