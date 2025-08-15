import 'core-js/actual/structured-clone';
import {setupZonelessTestEnv} from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv()
let idCounter = 0;
Object.defineProperty(global.crypto, 'randomUUID', {
  value: () => `mock-id-${idCounter++}`,
  writable: true,
});
