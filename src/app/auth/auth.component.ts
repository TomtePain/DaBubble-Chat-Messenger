import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const fadeOut = trigger('fadeOut', [
  state(
    'open',
    style({
      opacity: 1,
      transform: 'translate3d(0, 0, 1px)'
    })
  ),
  state(
    'close',
    style({
      opacity: 0,
      display: 'none',
    })
  ),
  transition('open => *', [animate('0.5s ease-out')]),
]);

const setLogoAnimation = trigger('setLogoAnimation', [
  state('open', style({
    transform: 'translate(398px, 311px)',
  })),
  state('closed', style({
    transform: 'translate(0px, 0px)',
  })),
  transition('open => closed', [
    animate('1s')
  ]),
])

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: [fadeOut, setLogoAnimation]
})
export class AuthComponent implements OnInit {
  hideRegister: boolean = false;
  isShown: boolean = true;

  alertMessage: string = '';
  onAlertTriggered(message: any) {
    this.alertMessage = message;
  }

  constructor(private router: Router, private auth:Auth) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        let url = ev.url;
        if (url === '/auth/register') {
          this.hideRegister = true
        } else {
          this.hideRegister = false
        }
      });
  }
  
  ngOnInit(): void {
    const currentPath = this.router.url;
    if (currentPath === '/auth') {
      this.router.navigate(['/auth/login']); // Weiterleitung zu /auth/login
    }
  }
  startAnimation() {
    setTimeout(() => {
      this.isShown = false;
    }, 500)
  }
  
}
