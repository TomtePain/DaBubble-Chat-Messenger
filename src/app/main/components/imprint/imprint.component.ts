import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent implements OnInit{

  constructor(private authservice: AuthService){}


  ngOnInit(): void {
    this.authservice.isShown = false;
  }

}
