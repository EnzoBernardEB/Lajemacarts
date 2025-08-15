import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {routes} from './app.routes';
import {environment} from "../environments/environment";
import {API_URL} from "./core/api-url.token";
import {provideHttpClient, withFetch} from "@angular/common/http";
import {provideNoopAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {provide: API_URL, useValue: environment.apiBaseUrl}
  ]
};
