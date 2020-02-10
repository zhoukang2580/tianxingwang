import { enableDebugTools } from "@angular/platform-browser";
import { NgModuleRef, ApplicationRef } from "@angular/core";
import { createNewHosts } from "@angularclass/hmr";

// export const hmrBootstrap = (
//   module: any,
//   bootstrap: () => Promise<NgModuleRef<any>>
// ) => {
//   let ngModule: NgModuleRef<any>;
//   module.hot.accept();
//   bootstrap().then(currentModule => (ngModule = currentModule));
//   module.hot.dispose(() => {
//     const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
//     const elements = appRef.components.map(c => c.location.nativeElement);
//     const removeOldHosts = createNewHosts(elements);
//     const appComp = appRef.components[0];
//     enableDebugTools(appComp);
//     ngModule.destroy();
//     removeOldHosts();
//   });
// };
export const hmrBootstrap = (
  module: any,
  bootstrap: () => Promise<NgModuleRef<any>>
) => {
  let ngModule: NgModuleRef<any>;
  module.hot.accept();
  bootstrap().then(mod => {
    ngModule = mod;
  });
  if (ngModule) {
    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    ngModule.destroy();
    module.hot.dispose(() => {
      const makeVisible = createNewHosts(elements);
      makeVisible();
    });
  }
};
