import { Component } from '@angular/core';
import { CrudService } from '../../../services/crud.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddPeopleToChannelComponent } from '../add-people-to-channel/add-people-to-channel.component';
import { UserService } from 'src/app/main/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss']
})
export class DialogAddChannelComponent {
  channelForm: FormGroup;
  channelName='';
  description='';
  channelPath = environment.channelDb;
  uid:any = this.userservice.userDBId;
  constructor(private crud:CrudService, private formBuilder: FormBuilder,public dialog:MatDialog,private dialogRef: MatDialogRef<DialogAddChannelComponent>, private userservice:UserService){
    this.channelForm = this.formBuilder.group({
      channelName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

  }



  onFormSubmit() {
    this.openDialog();
    this.dialogRef.close();
  }

openDialog(){
  if (this.channelForm.valid) {
     this.channelName = this.channelForm.get('channelName')?.value ;
     this.description = this.channelForm.get('description')?.value;
  }
  this.dialog.open(AddPeopleToChannelComponent,{
    data: {
      channelName: this.channelName,
      description: this.description,
      channelPath : this.channelPath,
      uid : this.uid
    },
  });
}

closeDialog() {
  this.dialogRef.close();
}

}
