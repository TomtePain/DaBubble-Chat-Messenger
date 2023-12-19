import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogProfileviewOfOthersComponent } from '../../dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { UserService } from '../../services/user.service';

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

constructor(private searchService: SearchService, public dialog: MatDialog, private userservice:UserService) {
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
