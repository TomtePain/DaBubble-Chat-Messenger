import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../../core/services/crud.service';
import { TreeService } from '../../../../core/services/tree.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent {
  messageUser: any = this.userservice.allUsers;
  channelsUser: any = [];
  selectedUser: any = [];
  searchResult:Array<any> = [];

  constructor(private crud: CrudService, public tree: TreeService, private userservice: UserService) {
    this.tree.isSearchActive = false;
  }


  checkForDm(i: number) {
    this.tree.routeToDmChannel(this.searchResult[i]);
  }

  initializeChannelUsers() {
    this.searchResult = [];
    this.searchResult = this.messageUser;
  }

  searching(event: any) {
    const searchTerm = event.target.value;
    this.channelsUser = this.tree.userChannels;
    if (searchTerm !== '') {
      this.tree.isSearchActive = true;
      this.channelsUser = this.filterDataByName(this.channelsUser, searchTerm);
      this.selectedUser = this.searchUser(searchTerm);
    } else {
      this.tree.isSearchActive = false;
    }
  }

  filterDataByName(data: any[], searchTerm: string): any[] {
    searchTerm = searchTerm.toLowerCase();
    return data.filter(item => item.name.toLowerCase().includes(searchTerm));
  }

  searchUser(searchValue: string) {
    this.searchResult = this.messageUser.filter((el: any) => {
      return el.fullName.toLowerCase().includes(searchValue.toLocaleLowerCase());
    })
  }

}
