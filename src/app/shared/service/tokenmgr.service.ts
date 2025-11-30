import { Injectable, signal } from '@angular/core';

const CTOKEN = 'authToken';
const CEXP = 'authTokenExpiry';

@Injectable({
  providedIn: 'root',
})
export class TokenmgrService {
 
  private token = signal<string | null>(null);

  // Devuelve el token
  getToken(): string | null {
    const token = sessionStorage.getItem(CTOKEN);
    return token && token.length > 0 ? token : null;
  }

  // Guarda el token y la expiración del mismo (10 minutos)
  saveToken(token: string, durationMs: number = 10 * 60 * 1000): void {
    const expiryTime = Date.now() + durationMs;
    sessionStorage.setItem(CTOKEN, token);
    sessionStorage.setItem(CEXP, expiryTime.toString());
    this.token.set(token);
  }

  // Borrar token
  deleteToken(): void{
    sessionStorage.removeItem(CTOKEN);
    sessionStorage.removeItem(CEXP);
    this.token.set(null);
  }

  // Si tiene token está autenticado
  isAuthenticated(): boolean {
    return !!this.token();
  }
}