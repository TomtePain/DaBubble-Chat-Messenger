import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { TreeService } from '../../services/tree.service';
import { UserService} from '../../services/user.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent {
  messageUser: any = this.userservice.allUsers;
  channelsUser: any = [];
  selectedUser: any = [];

  constructor(private crud: CrudService, public tree: TreeService, private userservice: UserService) {
   
  }


  checkForDm(i:number){
    this.tree.routeToDmChannel(this.messageUser[i]);
  }

  searching(event: any) {
    const searchTerm = event.target.value;
    this.channelsUser = this.tree.userChannels;
    if (searchTerm !== '') {
      this.tree.search = true;
      this.channelsUser = this.filterDataByName(this.channelsUser,searchTerm);
      this.messageUser = this.filterDataByName2(this.messageUser,searchTerm);
    } else {
     this.tree.search = false;
    }
  }

  filterDataByName2(data: any[], searchTerm: string): any[] {
    searchTerm = searchTerm.toLowerCase();  
    return data.filter(item => item.fullName.toLowerCase().includes(searchTerm));
  }

  filterDataByName(data: any[], searchTerm: string): any[] {
    searchTerm = searchTerm.toLowerCase();  
    return data.filter(item => item.name.toLowerCase().includes(searchTerm));
  }
}
