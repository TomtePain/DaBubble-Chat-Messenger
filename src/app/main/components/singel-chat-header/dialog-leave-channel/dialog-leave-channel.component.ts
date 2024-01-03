import { Component, Inject } from '@angular/core';
import { Firestore, arrayRemove, doc, updateDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/main/services/crud.service';
import { EditorService } from 'src/app/main/services/editor.service';
import { RefreshService } from 'src/app/main/services/refresh.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialog-leave-channel',
  templateUrl: './dialog-leave-channel.component.html',
  styleUrls: ['./dialog-leave-channel.component.scss', '../../chat-message/dialog-delete-message/dialog-delete-message.component.scss']
})
export class DialogLeaveChannelComponent {


  channelId;
  currentUser;
  isGuest:boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogLeaveChannelComponent>, public firestore: Firestore, public crud: CrudService, private route: ActivatedRoute, private router: Router, public dialog: MatDialog, private refreshservice: RefreshService) {
    this.channelId = data.channelId;
    this.currentUser = data.currentUser;
    this.checkIsGuest();
  }

  closeDialog(){
    this.dialogRef.close();
  }

  checkIsGuest() {
    if(this.currentUser == environment.guest) {
      this.isGuest = true;
    }else {
      this.isGuest = false;
    }
  }

  leaveChannel(){
    const docInstance = doc(this.firestore, environment.channelDb, this.channelId);
    updateDoc(docInstance, {
      ids: arrayRemove(this.currentUser)
    })
    .then(() => {
      this.dialog.closeAll();
      this.router.navigateByUrl('/' + environment.mainChannel);
      this.refreshservice.triggerRefresh();
    });
  }

}
