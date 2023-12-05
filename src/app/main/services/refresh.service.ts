import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {

  constructor() { }

  private refreshSubject = new Subject<void>();

  get refreshObservable() {
    return this.refreshSubject.asObservable();
  }

  triggerRefresh() {
    this.refreshSubject.next();
  }
}
