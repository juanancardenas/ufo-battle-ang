import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../model/constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  loggedIn = signal(false);

  userLogin(user : string, passwd : string): Observable<any>{
    // Conectar con el API como "observable"
    // Remember: if you need to save any value in a header, use observe:'response'
    return this.http.get(`${BASE_URL}/users/login?username=${user}&password=${passwd}`, { observe: 'response' });
  }

  setLogin() {
    this.loggedIn.set(true);
  }

  setLogout() {
    this.loggedIn.set(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }
}