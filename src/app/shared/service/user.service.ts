import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../model/constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);

  loggedIn = signal(false);

  userLogin(user : string, password : string): Observable<any> {
    // Conectar con el API como "observable". Usamos observe:'response' para guardar valores en cabecera.
    return this.http.get(`${BASE_URL}/users/login?username=${user}&password=${password}`, { observe: 'response' });
  }

  userCheck(user : string): Observable<any> {
    // Chequear si existe el nuevo userName
    return this.http.get(`${BASE_URL}/users/${user}`, { observe: 'response' });
  }

  registerUser(user : string, password : string, email: string): Observable <any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('username', user);
    body.set('email', email);
    body.set('password', password);
    console.log("Body: " + body.toString());

    return this.http.post(`${BASE_URL}/users`, body.toString(), { headers: headers, observe: 'response' });
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