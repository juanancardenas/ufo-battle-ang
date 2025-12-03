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

  // Lee las preferencias desde el sessionStorage, si no hubiese valores grabados,
  // pasa unos valores por defecto, los mismos que muestra el componente inicialmente
  getPreferences(): Preferences {
    const numberUfo = parseInt(sessionStorage.getItem(this.UFO_KEY) || '1');
    const time = parseInt(sessionStorage.getItem(this.TIME_KEY) || '60');
    
    let sendResult = false;
    const raw = sessionStorage.getItem(this.SEND_KEY);
    if ( raw !== null ) sendResult = JSON.parse(raw); // Convierte a boolean

    return new Preferences({
      numberUfo,
      time,
      sendResult
    });
  }

  // Graba las preferencias en el sessionStorage
  savePreferences(prefs: Preferences): void {
    sessionStorage.setItem(this.UFO_KEY, prefs.numberUfo.toString());
    sessionStorage.setItem(this.TIME_KEY, prefs.time.toString());
    sessionStorage.setItem(this.SEND_KEY, prefs.sendResult.toString());
  }
}