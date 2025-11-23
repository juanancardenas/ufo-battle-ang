import { Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { PreferencesComponent } from './preferences/preferences.component';
import { PlayComponent } from './play/play.component';
import { RecordsComponent } from './records/records.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'play', component: PlayComponent },
  { path: 'records', component: RecordsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent }
];