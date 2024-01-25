import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit{

  constructor(private authservice: AuthService){}


  ngOnInit(): void {
    this.authservice.isShown = false;
  }

}
