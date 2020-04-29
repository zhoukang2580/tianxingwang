import { ErrorHandler } from "@angular/core";
import { LogService } from "./services/log/log.service";
import { environment } from "src/environments/environment";
import { LoadingController, Platform } from "@ionic/angular";
import { LanguageHelper } from "./languageHelper";
import { AppHelper } from "./appHelper";
import { FileHelperService } from "./services/file-helper.service";

export class AppErrorHandler implements ErrorHandler {
  constructor(
    private logService: LogService,
    private loadingCtrl: LoadingController,
    private plt: Platform,
    private flileService: FileHelperService
  ) {}
  async handleError(error: any) {
    console.error(error);
    setTimeout(() => {
      this.loadingCtrl.getTop().then((t) => {
        if (t) {
          t.dismiss();
        }
      });
    }, 5000);
    if (environment.production) {
      const hcpversion = this.flileService.getLocalHcpVersion();
      const appversion = await this.flileService
        .getAppVersion()
        .catch(() => "");
      let channel = `${this.plt.is("ios") ? "ios" : "android"}`;
      if (AppHelper.isApp()) {
        channel += ` app(appversion=${appversion},hcpversion=${hcpversion})`;
      } else if (AppHelper.isWechatH5()) {
        channel += " wechatH5";
      } else if (AppHelper.isDingtalkH5()) {
        channel += " DingtalkH5";
      } else if (AppHelper.isWechatMini()) {
        channel += " WechatMini";
      } else if (!AppHelper.isApp()) {
        channel += " H5";
      }
      this.logService.addException({
        Message: LanguageHelper.getApiMobileAppError() + `,来自 ${channel}`,
        Method: "AppErrorHandler",
        Error: error,
      });
    }
  }
}
