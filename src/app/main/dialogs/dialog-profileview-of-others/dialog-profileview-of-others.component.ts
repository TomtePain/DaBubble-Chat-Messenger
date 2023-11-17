import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrudService } from '../../services/crud.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { DialogShowChannelUserComponent } from '../../components/singel-chat-header/dialog-show-channel-user/dialog-show-channel-user.component';

@Component({
  selector: 'app-dialog-profileview-of-others',
  templateUrl: './dialog-profileview-of-others.component.html',
  styleUrls: ['./dialog-profileview-of-others.component.scss']
})
export class DialogProfileviewOfOthersComponent implements OnInit {

  userId: string;
  channelUser: Array<any>;
  existingUser:any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogProfileviewOfOthersComponent>,
    public dialog: MatDialog,
    public firestore: Firestore,
    public crud: CrudService,
    public tree: TreeService) {
    this.channelUser = data.userInfo;
    this.userId = data.userId;
  }


  ngOnInit(): void {
   this.getUserInfo();
  }

  getUserInfo() {
    let existingUser = this.channelUser.find((exist) => exist.id == this.userId);
    if(existingUser){
      this.existingUser = existingUser;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  messagetoUser(user:any) {
    this.tree.routeToDmChannel(user);
    this.closeDialog();
  }
}
