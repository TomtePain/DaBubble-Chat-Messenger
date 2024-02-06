import { Component, Inject } from '@angular/core';
import { CrudService } from '../../../../core/services/crud.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddPeopleToChannelComponent } from '../add-people-to-channel/add-people-to-channel.component';
import { UserService } from 'src/app/core/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UploadComponent } from 'src/app/modules/main/dialogs/upload/upload.component';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss']
})
export class DialogAddChannelComponent {
  channelForm: FormGroup;
  channelName = '';
  description = '';
  allChannels: Array<any> = [];
  channelPath = environment.channelDb;
  uid: any = this.userservice.userDBId;
  constructor(private crud: CrudService, private formBuilder: FormBuilder, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) private data: any, private dialogRef: MatDialogRef<DialogAddChannelComponent>, private userservice: UserService) {
    this.channelForm = this.formBuilder.group({
      channelName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
    this.allChannels = data.channels;
  }



  onFormSubmit() {
    this.openDialog();
    this.dialogRef.close();
  }

  openDialog() {
    if (this.channelForm.valid) {
      this.channelName = this.channelForm.get('channelName')?.value.trim();
      this.description = this.channelForm.get('description')?.value;
    }
    if(!this.checkChannelExist()){
      this.showAddPeopleDialog();
    } else {
      this.showUploadDialog('channel exist');
    }
    
  }

  closeDialog() {
    this.dialogRef.close();
  }

  checkChannelExist() {
    let exist = this.allChannels.find(channel => channel.name == this.channelName);
    if(exist){
      return true 
    } else {
      return false
    }
  }

  showUploadDialog(msg: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      data: { typeOfMessage: msg },
    });
  }

  showAddPeopleDialog(){
    this.dialog.open(AddPeopleToChannelComponent, {
      data: {
        channelName: this.channelName,
        description: this.description,
        channelPath: this.channelPath,
        uid: this.uid
      },
    });
  }
}
