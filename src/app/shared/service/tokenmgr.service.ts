import { Injectable } from '@angular/core';

const CTOKEN = 'authToken';

@Injectable({
  providedIn: 'root',
})
export class TokenmgrService {
 
  getToken(): string | null{
    return sessionStorage.getItem(CTOKEN);
  }

  saveToken(token: string): void{
    sessionStorage.setItem(CTOKEN, token);
  }

  deleteToken(): void{
    sessionStorage.removeItem(CTOKEN);
  }
}