import { CONFIG } from 'src/app/config';

export const environment = {
  production: CONFIG.production,
  localhost: false,
  disableNetWork: false,
  enableLocalData: false,
  mockProBuild: CONFIG.mockProBuild
};
