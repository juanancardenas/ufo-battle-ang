import { Injectable } from '@angular/core';
import { Preferences } from '../model/preferences.model';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private readonly UFO_KEY = 'pref_numberUfo';
  private readonly TIME_KEY = 'pref_time';

  constructor() {}

  getPreferences(): Preferences {
    const numberUfo = parseInt(sessionStorage.getItem(this.UFO_KEY) || '1');
    const time = parseInt(sessionStorage.getItem(this.TIME_KEY) || '60');

    return new Preferences({
      numberUfo,
      time
    });
  }

  savePreferences(prefs: Preferences): void {
    sessionStorage.setItem(this.UFO_KEY, prefs.numberUfo.toString());
    sessionStorage.setItem(this.TIME_KEY, prefs.time.toString());
  }
}