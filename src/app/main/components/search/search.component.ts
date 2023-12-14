import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  displaySearchResults: boolean = false;
  searchResultsMessages: any = [];
  searchResultsChannels: any = [];
  searchResultsUsers: any = [];
  searchInput!: string;

constructor(private searchService: SearchService) {
  }

search(input: string) {
  if (input.length > 2) {
    setTimeout(() => {
      this.searchMessages(input);
      if (this.searchResultsMessages.length > 0) {
        this.displaySearchResults = true
      }
    }, 500);

  } else {
    this.displaySearchResults = false;
  }
}

clearSearch() {
  this.searchInput = "";
  this.searchResultsMessages = [];
}

searchChannels(input: string) {
  // TODO create search for channelNames as available for the messages. Result should link to the channel
  // console.log("input in searchChannels", input);
}

searchUsers(input: string) {
  // TODO create search for users as available for the messages/channels. It should link to the found users' profile card
  // console.log("input in searchChannels", input);
}

async searchMessages(input: string) {
  // console.log("input in searchThreads", input);
  this.searchResultsMessages = await this.searchService.searchMessages(input)
  // console.log("this.searchResults", this.searchResults);
}

splitSentence(sentence: string): string[] {
  // Regular expression to match spaces and punctuation marks
  // const regex = /[\s!"§$%&/()=?`*_:;>°^´+#-.,<¡“¶¢[]|{}≠¿'±æ–…∞≤„«∑€†¨⁄øπ•æœ@∆ºª©ƒ∂‚å¥≈ç~µ]+/;
  const regex = /\W+/;
  return sentence.split(regex).filter(word => word.length > 0);
}



}
