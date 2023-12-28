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
import { DialogLeaveChannelComponent } from './components/singel-chat-header/dialog-leave-channel/dialog-leave-channel.component';

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
      },
      // {
      //   path: '**', // Wildcard route for a component
      //   redirectTo: '' // Redirect to the parent component
      // }
    ]
  }
  // ,
  // {
  //   path: '**', // Wildcard route for the entire app
  //   redirectTo: "/" + environment.mainChannel // Redirect to the default channel or some other route
  // }
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