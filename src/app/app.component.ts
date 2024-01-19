import { Component } from '@angular/core';
import { TreeService } from './main/services/tree.service';
import { SearchService } from './main/services/search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dabubble';

  constructor(private tree: TreeService, private searchservice: SearchService) {}

  // Closes the navigation tree when clicking anywhere in the application. There is a hostlistener added in the workspace-main.component.ts that makes sure that the navigation tree can be opened by click and the navigation within can be clicked though the method below is included.
  onDocumentClick(): void {
    this.tree.closeWorkspace();
    this.searchservice.clearSearch();
  }
}
