import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { PreferencesService } from './shared/service/preferences.service';
import { ResultsService } from './shared/service/results.service';
import { ToastService } from './shared/service/toast.service';
import { TokenmgrService } from './shared/service/tokenmgr.service';
import { UserService } from './shared/service/user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    PreferencesService,
    ResultsService,
    ToastService,
    TokenmgrService,
    UserService
  ]
};