import { ErrorHandler } from '@angular/core';
import { LogService } from './services/log/log.service';
import { environment } from 'src/environments/environment';
import { LoadingController } from '@ionic/angular';
import { LanguageHelper } from './languageHelper';

export class AppErrorHandler implements ErrorHandler {
    constructor(private logService: LogService,private loadingCtrl: LoadingController) { }
    handleError(error: any) {
        setTimeout(() => {
            this.loadingCtrl.getTop().then((t) => {
                if (t) {
                t.dismiss();
              }
            });
          }, 5000);
        if(environment.production){
            this.logService.addException({
                Message: LanguageHelper.getApiMobileAppError(),
                Method: "AppErrorHandler",
                Error: error
            });
        }
        if(!environment.production){
            // console.dir(error);
            console.error(error);
        }
    }
}