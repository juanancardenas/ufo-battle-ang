import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../model/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
 
  private http = inject(HttpClient);

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
}