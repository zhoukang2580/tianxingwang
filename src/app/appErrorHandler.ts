import { ErrorHandler } from '@angular/core';
import { LogService } from './services/log/log.service';
import { environment } from 'src/environments/environment';

export class AppErrorHandler implements ErrorHandler {
    constructor(private logService: LogService) { }
    handleError(error: any) {
        if(environment.production){
            this.logService.sendException({
                Message: "应用内部错误",
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