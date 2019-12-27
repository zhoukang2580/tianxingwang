import { RequestEntity } from './../api/Request.entity';
import { IdentityService } from "src/app/services/identity/identity.service";
import { LoginService } from "./../login/login.service";
import { ConfigEntity } from "./config.entity";
import { ApiService } from "../api/api.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, from, of, Observable, throwError } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { switchMap, tap, map, finalize, catchError, skipUntil } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private config: ConfigEntity;
  private fetchConfig: { promise: Promise<any>; }
  constructor(
    private apiService: ApiService,
    identityService: IdentityService
  ) {
    this.disposal();
    this.get()
      .then(_ => {
        console.log("get ConfigService complete");
      })
      .catch(e => {
        console.log("ConfigService get error", e);
      });
    identityService.getIdentitySource().subscribe(identity => {
      if (!identity || !identity.Ticket) {
        this.disposal();
      }
    });
  }
  disposal() {
    this.config = new ConfigEntity();
    this.config.Status = false;
  }
  getConfigAsync() {
    return this.load();
  }
  getConfigSource(){
    return from(this.load());
  }
  get(): Promise<ConfigEntity> {
    return this.getConfigAsync();
  }
  private load(): Promise<ConfigEntity> {
    if (this.config.Status) {
      return Promise.resolve(this.config);
    }
    if (this.fetchConfig && this.fetchConfig.promise) {
      return this.fetchConfig.promise;
    }
    const data = { domain: AppHelper.getDomain() };
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Router-Get";
    req.Data = data;
    this.fetchConfig = {
      promise: this.apiService.getPromiseData<{
        DefaultImageUrl?: string;
        FaviconImageUrl?: string;
        PrerenderImageUrl?: string;
        LogoImageUrl?: string;
        Icp?: string;
        Style?: string;
      }>(req).then(res => {
        if (res) {
          this.config.Status = true;
          this.config.DefaultImageUrl = res.DefaultImageUrl;
          this.config.FaviconImageUrl = res.FaviconImageUrl;
          this.config.PrerenderImageUrl = res.PrerenderImageUrl;
          this.config.LogoImageUrl = res.LogoImageUrl;
          this.config.Icp = res.Icp;
          this.config.Style = res.Style;
        }
        return this.config;
      })
        .catch(_ => {
          this.config.Status = false;
          this.config.DefaultImageUrl = AppHelper.getDefaultAvatar();
          this.config.FaviconImageUrl = AppHelper.getDefaultAvatar();
          this.config.PrerenderImageUrl = AppHelper.getDefaultLoadingImage();
          this.config.LogoImageUrl=`assets/images/Logodm.png`;
        })
        .finally(() => {
          this.fetchConfig = null;
        })
    }
    return this.fetchConfig.promise;
  }
}
