import {setupZoneTestEnv} from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

let idCounter = 0;
Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => `mock-id-${idCounter++}`,
  writable: true,
});
