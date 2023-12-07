import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileviewOfOthersComponent } from 'src/app/main/dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { ProfileComponent } from 'src/app/main/dialogs/profile/profile.component';
import { CrudService } from 'src/app/main/services/crud.service';
import { environment } from 'src/environments/environment';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-dialog-show-channel-user',
  templateUrl: './dialog-show-channel-user.component.html',
  styleUrls: ['./dialog-show-channel-user.component.scss'],
  host: {
    'class': 'show-channel-user-content'
  }
})
export class DialogShowChannelUserComponent implements OnInit {

  channelUser: Array<any>;
  allUserDataInfo: Array<any> = [];
  existingUser?: string;
  channelName: string;
  channelUserIds: Array<any> = [];
  channelId: string = '';


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogShowChannelUserComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService) {
    this.channelUser = data.channelUser;
    this.channelName = data.channelName;
    this.channelId = data.channelId;
  }


  ngOnInit(): void {
    this.getOnlyUserIds();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  viewUsersProfile(userId:any) {
    this.dialog.open(DialogProfileviewOfOthersComponent, {
      data: {
        userId: userId,
        userInfo: this.channelUser
      }
    });
  }

  openAddUserDialog() {
    this.dialog.open(DialogAddUserComponent, {
      data: {
        channelName: this.channelName,
        channelUser: this.channelUserIds,
        channelId: this.channelId
      }
    });
  }

  getOnlyUserIds() { 
    this.channelUser.forEach((user) => {
      let userID = user.id
      this.channelUserIds.push(userID);
    })
  }

}
