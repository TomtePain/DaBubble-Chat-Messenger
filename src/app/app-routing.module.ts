import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './modules/main/main.component';
import { AuthComponent } from './modules/auth/auth.component';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { PagenotfoundComponent } from './shared/pagenotfound/pagenotfound.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { PrivacyComponent } from './shared/privacy/privacy.component';
const redirectToLogin = () => redirectUnauthorizedTo(['auth/login']);
const routes: Routes = [
  {path: 'imprint', component: ImprintComponent},
  {path: 'privacy', component: PrivacyComponent},
  {
    path: '',
    component: MainComponent,
    loadChildren: () => import('./modules/main/main-router.module').then(m => m.MainRoutingModule),
    ...canActivate(redirectToLogin)
  },
  {
    path: 'auth',
    component: AuthComponent,
    loadChildren: () => import('./modules/auth/auth-router.module').then(m => m.AuthRoutingModule)
  },
  {path: '**', component: PagenotfoundComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes , { anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
