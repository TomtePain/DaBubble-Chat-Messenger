import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingelChatComponent } from './components/singel-chat/singel-chat.component';
import { ThreadComponent } from './components/thread/thread.component';
import { DialogChannelEditComponent } from './components/singel-chat-header/dialog-channel-edit/dialog-channel-edit.component';
import { DialogShowChannelUserComponent } from './components/singel-chat-header/dialog-show-channel-user/dialog-show-channel-user.component';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DialogDeleteMessageComponent } from './components/chat-message/dialog-delete-message/dialog-delete-message.component';
import { DialogAddUserComponent } from './components/singel-chat-header/dialog-add-user/dialog-add-user.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: "/" + environment.mainChannel, // specify your target route here
    pathMatch: 'full'
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
  },
  {
    path: ':id/:messageId',
    component: SingelChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule ],
  exports: [RouterModule],
  declarations: [
    DialogChannelEditComponent,
    DialogShowChannelUserComponent,
    DialogDeleteMessageComponent,
    DialogAddUserComponent
  ]
})

export class MainRoutingModule { }