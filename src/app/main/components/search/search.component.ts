import { Component, HostListener } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  displaySearchResults: boolean = false;
  searchResultsMessages: Array<any> = [];
  searchResultsChannels: Array<any> = [];
  searchResultsUsers: Array<any> = [];
  searchInput!: string;
  allUserDataInfo: Array<any> = [];
  searchTimeout: any = null;
  private searchState: Subscription;  

constructor(private searchService: SearchService, public dialog: MatDialog, private userservice:UserService) {
  this.searchState = this.searchService.searchState$.subscribe(value => {
    this.search(value);
  });
  }

// There is a global method in the app.component.ts that resets the search when there is a click anywhere in the app. The HostListener below makes sure the search field and results can still be clicked though the global method is active.
@HostListener('click', ['$event'])
onClick(event: Event): void {
  event.stopPropagation();
}

search(input: string) {
  // Clear the existing timeout
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }
  // Delay the search result for a specific time to gather the input string correctly
  this.searchTimeout = setTimeout(() => {
    if (input.length > 1) {
      this.executeSearch(input)
    } else if (!input) {
      this.clearSearch();
    }
    else {
      this.displaySearchResults = false;
    }
  }, 500); // Check if delay should be shorter or longer 
}

clearSearch() {
  this.searchInput = "";
  this.searchResultsMessages = [];
  this.searchResultsChannels = [];
  this.searchResultsUsers = [];
}

executeSearch(input: string) {
  this.searchMessages(input);
  this.searchChannels(input);
  this.searchUsers(input);
  if (this.isSearchResultAvailable()) {
    this.displaySearchResults = true;
  } else {
    this.displaySearchResults = false;
  }
}

isSearchResultAvailable() {
  return this.searchResultsMessages.length > 0 || this.searchResultsChannels.length > 0 || this.searchResultsUsers.length > 0;
}


async searchChannels(input: string) {
  this.searchResultsChannels = await this.searchService.searchChannels(input);
}

async searchUsers(input: string) {
  this.searchResultsUsers = await this.searchService.searchUsers(input);

}

async searchMessages(input: string) {
  this.searchResultsMessages = await this.searchService.searchMessages(input)
}

splitSentence(sentence: string): string[] {
  // Regular expression to match spaces and punctuation marks
  // const regex = /[\s!"§$%&/()=?`*_:;>°^´+#-.,<¡“¶¢[]|{}≠¿'±æ–…∞≤„«∑€†¨⁄øπ•æœ@∆ºª©ƒ∂‚å¥≈ç~µ]+/;
  const regex = /\W+/;
  return sentence.split(regex).filter(word => word.length > 0);
}

async viewUsersProfile(userId:any) {
  this.allUserDataInfo = this.userservice.allUsers;
  this.dialog.open(DialogProfileviewOfOthersComponent, {
    data: {
      userId: userId,
      userInfo: this.allUserDataInfo    }
  });
}
}
