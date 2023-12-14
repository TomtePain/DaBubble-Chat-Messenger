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
  //TODO create some sort of input lag to avoid search problems by too fast input
  if (input.length > 2) {
    setTimeout(() => {
      this.searchMessages(input);
      this.searchChannels(input);
      if (this.searchResultsMessages.length > 0 || this.searchResultsChannels > 0) {
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

async searchChannels(input: string) {
  // TODO create search for channelNames as available for the messages. Result should link to the channel path
  // console.log("input in searchChannels", input);
  this.searchResultsChannels = await this.searchService.searchChannels(input);
  console.log("this.searchResultsChannels in search Component", this.searchResultsChannels);
  
}

searchUsers(input: string) {
  // TODO create search for users as available for the messages/channels. It should link to the found users' profile card
  // console.log("input in searchChannels", input);
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



}
