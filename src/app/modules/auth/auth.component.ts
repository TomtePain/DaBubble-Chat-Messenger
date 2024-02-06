import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  hideRegister: boolean = false;
  
  alertMessage: string = '';
  onAlertTriggered(message: any) {
    this.alertMessage = message;
  }

  constructor(private router: Router, private auth: Auth) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        this.updateHideRegister(ev.url);
      });
  }
  
  ngOnInit(): void {
    const currentPath = this.router.url;
    this.updateHideRegister(currentPath);
    if (currentPath === '/auth') {
      this.router.navigate(['/auth/login']); // Redirect to /auth/login
    }
  }
  
  updateHideRegister(url: string) {
    this.hideRegister = url.startsWith('/auth/register') || url.startsWith('/auth/setnewpassword');
  }
  
}