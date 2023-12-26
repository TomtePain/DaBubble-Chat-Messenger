import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AuthComponent } from './auth/auth.component';
import { redirectUnauthorizedTo, canActivate } from '@angular/fire/auth-guard';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
const redirectToLogin = () => redirectUnauthorizedTo(['auth/login']);
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    loadChildren: () => import('./main/main-router.module').then(m => m.MainRoutingModule),
     ...canActivate(redirectToLogin)
  },
  {
    path: 'auth',
    component: AuthComponent,
    loadChildren: () => import('./auth/auth-router.module').then(m => m.AuthRoutingModule)
  },
  {path: '**', component: PagenotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes , { anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
