import { Injectable } from '@angular/core';
import { Preferences } from '../model/preferences.model';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private readonly UFO_KEY = 'pref_numberUfo';
  private readonly TIME_KEY = 'pref_time';
  private readonly SEND_KEY = 'pref_sendResult';

  constructor() {}

  getPreferences(): Preferences {
    const numberUfo = parseInt(sessionStorage.getItem(this.UFO_KEY) || '1');
    const time = parseInt(sessionStorage.getItem(this.TIME_KEY) || '60');
    
    let sendResult = false;
    const raw = sessionStorage.getItem(this.SEND_KEY);
    if ( raw !== null ) sendResult = JSON.parse(raw); // Convierte a boolean.

    return new Preferences({
      numberUfo,
      time,
      sendResult
    });
  }

  savePreferences(prefs: Preferences): void {
    sessionStorage.setItem(this.UFO_KEY, prefs.numberUfo.toString());
    sessionStorage.setItem(this.TIME_KEY, prefs.time.toString());
    sessionStorage.setItem(this.SEND_KEY, prefs.sendResult.toString());
  }
}