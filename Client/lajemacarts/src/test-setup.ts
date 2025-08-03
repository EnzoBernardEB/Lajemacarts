import {setupZoneTestEnv} from 'jest-preset-angular/setup-env/zone';
import 'core-js/actual/structured-clone';
setupZoneTestEnv();

let idCounter = 0;
Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => `mock-id-${idCounter++}`,
  writable: true,
});
