import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingelChatComponent } from './components/singel-chat/singel-chat.component';
import { ThreadComponent } from './components/thread/thread.component';
import { DialogChannelEditComponent } from './components/singel-chat-header/dialog-channel-edit/dialog-channel-edit.component';
import { DialogShowChannelUserComponent } from './components/singel-chat-header/dialog-show-channel-user/dialog-show-channel-user.component';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './dialogs/upload/upload.component';

const routes: Routes = [
  {path:'', component: SingelChatComponent},
  {path:':id' , component:SingelChatComponent,
  children: [
    {
      path: 'thread/:id', 
      component: ThreadComponent
    }
  ]},
  {path:':id' , component:SingelChatComponent,  children: [
    {
      path: 'newthread/:id', 
      component: ThreadComponent
    }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule ],
  exports: [RouterModule],
  declarations: [
    DialogChannelEditComponent,
    DialogShowChannelUserComponent
  ]
})

export class MainRoutingModule { }