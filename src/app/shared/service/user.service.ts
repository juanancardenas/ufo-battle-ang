import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL, TIME_TOKEN } from '../model/constants';
import { TokenmgrService } from './tokenmgr.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  private tokenMgr = inject(TokenmgrService);
  private toast = inject(ToastService);

  isLogged = signal<boolean>(false);
  private logoutTimer: any;

  // En caso de refresco, si el usuario tiene token y está logado, 
  // debe permanecer logado
  constructor() {
    this.initSession();
  }

  private initSession() {
    const token = this.tokenMgr.getToken();
    const username = sessionStorage.getItem('username');

    if (token && username) {
      this.isLogged.set(true);
      this.setAutoLogout(TIME_TOKEN);
    } else {
      this.isLogged.set(false);
    }
  }

  /*
   * Obtener token desde del API a partir de usuario y password
   * introducidos en el login de la aplicación
   */
  userLogin(user : string, password : string): Observable<any> {
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(password);

    return this.http.get(`${BASE_URL}/users/login?username=${u}&password=${p}`, {
      observe: 'response'
    });
  }

  /*
   * Chequea si el usuario existe en el API. Se lanza desde el
   * formulario de registro de usuario
   */
  userCheck(user : string): Observable<any> {
    // Chequear si existe el nuevo userName
    return this.http.get(`${BASE_URL}/users/${user}`, { observe: 'response' });
  }

  /*
   * Registro de un nuevo usuario
   */
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

  /*
   * Crear sesión de usuario
   */
  createSession(username: string, token: string) {
    this.tokenMgr.deleteToken();
    this.tokenMgr.saveToken(token);
    this.setUsername(username);
    this.setAutoLogout(TIME_TOKEN);
    this.isLogged.set(true);
  } 

  /*
   * Alarga la sesión debido a que se ha recibido un nuevo token
   */
  increaseSession(token: string) {
    this.tokenMgr.deleteToken();
    this.tokenMgr.saveToken(token);
    this.setAutoLogout(TIME_TOKEN);
    this.isLogged.set(true);
  }

  /*
   * Cierra la sesión de usuario
   */
  closeSession() {
    sessionStorage.removeItem('username');
    this.tokenMgr.deleteToken();
    this.isLogged.set(false);
    clearTimeout(this.logoutTimer);
  }

  // Indica si el usuario está logado, es decir, tiene token válido
  isLoggedIn(): boolean {
    return !!this.tokenMgr.getToken();
  }

  // Guardar nombre de usuario en sesión
  setUsername(username: string) {     
    sessionStorage.setItem('username', username);
  }

  // Recuperar nombre de usuario de sesión
  getUsername(): string {
    return sessionStorage.getItem('username') ?? '';
  }

  // Prepara el auto logout en base al tiempo que se le pase
  private setAutoLogout(ms: number) {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.logoutTimer = setTimeout(() => {
      this.toast.show("Token expirado, vuelva a hacer log in","info");
      this.closeSession();
    }, ms);
  }
}