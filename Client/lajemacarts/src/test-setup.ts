import {setupZoneTestEnv} from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => 'mock-uuid',
  writable: true,
});
