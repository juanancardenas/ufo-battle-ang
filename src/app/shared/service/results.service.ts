import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../model/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenmgrService } from './tokenmgr.service';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
 
  private http = inject(HttpClient);
  private tokenService = inject(TokenmgrService);

  /*
   * Realiza un POST con los resultados a enviar al API. Los valores number
   * son convertidos en String porque así lo requiere el contrato.
   */
  sendResults(score: number, ufos: number, time: number, token: string): Observable<any> {
    
    const body = new URLSearchParams();
    body.set('punctuation', score.toString());
    body.set('ufos', ufos.toString());
    body.set('disposedTime', time.toString());
    
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    return this.http.post(`${BASE_URL}/records`, body.toString(),
      { headers: headers, observe: 'response' }
    );
  }

  /*
   * Realiza un GET para obtener los 10 mejores resultados indistintamente
   * del usuario logado.
   */
  getTopScores(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(`${BASE_URL}/records`, 
      { headers: headers, observe: 'response' }
    );
  }

  /*
   * Realiza un GET para obtener los 10 mejores resultados del usuario logado.
   */
  getUserScores(username: string): Observable<any> {  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.tokenService.getToken() ?? ''
    });

    return this.http.get(`${BASE_URL}/records/${username}`, 
      { headers: headers, observe: 'response' }
    );
  }
}