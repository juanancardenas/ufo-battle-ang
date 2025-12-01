import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '../shared/model/preferences.model';
import { PreferencesService } from '../shared/service/preferences.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.css',
})
export class PreferencesComponent {
  
  model: Preferences;

  constructor( private prefsService: PreferencesService, private router: Router ) {
    this.model = this.prefsService.getPreferences();
  }

  save(event?: Event): void {
    if(event) event.preventDefault();
    
    this.prefsService.savePreferences(this.model);
    this.router.navigateByUrl('/play');
  }
}