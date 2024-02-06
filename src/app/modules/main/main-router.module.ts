import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingelChatComponent } from './components/singel-chat/singel-chat.component';
import { ThreadComponent } from './components/thread/thread.component';
import { DialogChannelEditComponent } from './dialogs/dialog-channel-edit/dialog-channel-edit.component';
import { DialogShowChannelUserComponent } from './dialogs/dialog-show-channel-user/dialog-show-channel-user.component';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DialogDeleteMessageComponent } from './dialogs/dialog-delete-message/dialog-delete-message.component';
import { DialogAddUserComponent } from './dialogs/dialog-add-user/dialog-add-user.component';
import { DialogLeaveChannelComponent } from './dialogs/dialog-leave-channel/dialog-leave-channel.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: "/" + environment.mainChannel, // specify your target route here
    pathMatch: 'full'
  },
  { 
    path: ':id/msg/:messageId',
    component: SingelChatComponent
  },
  {
    path: ':id',
    component: SingelChatComponent,
    children: [
      {
        path: 'thread/:id',
        component: ThreadComponent
      },
      {
        path: 'newthread/:id',
        component: ThreadComponent
      },
      {
        path: 'thread/:id/:messageId',
        component: ThreadComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule ],
  exports: [RouterModule],
  declarations: [
    DialogChannelEditComponent,
    DialogShowChannelUserComponent,
    DialogDeleteMessageComponent,
    DialogAddUserComponent,
    DialogLeaveChannelComponent
  ]
})

export class MainRoutingModule { }