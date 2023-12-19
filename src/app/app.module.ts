import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxTypedJsModule } from 'ngx-typed-js';



import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatCardModule } from '@angular/material/card';


import { MatTreeModule } from '@angular/material/tree';
import { MatDialogModule } from '@angular/material/dialog';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './main/components/header/header.component';
import { WorkspaceMainComponent } from './main/components/workspace/workspace-main/workspace-main.component';
import { TreeComponent } from './main/components/workspace/tree/tree.component';
import { AuthComponent } from './auth/auth.component';

import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotpwdComponent } from './auth/components/forgotpwd/forgotpwd.component';
import { SetnewpasswdComponent } from './auth/components/setnewpasswd/setnewpasswd.component';


import { DialogAddChannelComponent } from './main/components/workspace/dialog-add-channel/dialog-add-channel.component';
import { AddPeopleToChannelComponent } from './main/components/workspace/add-people-to-channel/add-people-to-channel.component';

import { ProfileComponent } from './main/dialogs/profile/profile.component';
import { DialogProfileviewOfOthersComponent } from './main/dialogs/dialog-profileview-of-others/dialog-profileview-of-others.component';
import { SingelChatComponent } from './main/components/singel-chat/singel-chat.component';
import { SingelChatHeaderComponent } from './main/components/singel-chat-header/singel-chat-header.component';
import { ThreadComponent } from './main/components/thread/thread.component';

import { provideStorage, getStorage } from '@angular/fire/storage';
import { AlertComponent } from './auth/components/alert/alert.component';
import { ChatMessageComponent } from './main/components/chat-message/chat-message.component';
import { EditorComponent } from './main/components/editor/editor.component';
import { ThreadMessageComponent } from './main/components/thread-message/thread-message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReactionComponent } from './main/components/reaction/reaction.component';
import { NewMessageComponent } from './main/components/new-message/new-message.component';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UploadComponent } from './main/dialogs/upload/upload.component';
import { SearchComponent } from './main/components/search/search.component';
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    WorkspaceMainComponent,
    TreeComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    ForgotpwdComponent,
    SetnewpasswdComponent,
    DialogAddChannelComponent,
    AddPeopleToChannelComponent,
    ProfileComponent,
    SingelChatComponent,
    ThreadComponent,
    AlertComponent,
    ChatMessageComponent,
    EditorComponent,
    ThreadMessageComponent,
    UploadComponent,
    ReactionComponent,
    NewMessageComponent,
    SingelChatHeaderComponent,
    DialogProfileviewOfOthersComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    BrowserAnimationsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    NgxTypedJsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTreeModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCardModule,
    provideStorage(() => getStorage()),
    PickerComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
