import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {routes} from './app.routes';
import {environment} from "../environments/environment";
import {API_URL} from "./core/api-url.token";
import {provideHttpClient, withFetch} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {provide: API_URL, useValue: environment.apiBaseUrl}
  ]
};
