import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotpwdComponent } from './components/forgotpwd/forgotpwd.component';
import { SetnewpasswdComponent } from './components/setnewpasswd/setnewpasswd.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'forgotpassword',
        component: ForgotpwdComponent
    },
    {
        path: 'setnewpassword',
        component: SetnewpasswdComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [  ]
})

export class AuthRoutingModule { }