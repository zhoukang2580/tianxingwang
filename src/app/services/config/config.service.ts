import { IdentityService } from "src/app/services/identity/identity.service";
import { LoginService } from "./../login/login.service";
import { ConfigEntity } from "./config.entity";
import { RequestEntity } from "../api/Request.entity";
import { ApiService } from "../api/api.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, from, of, Observable, throwError } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { switchMap, tap, map, finalize } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private config: ConfigEntity;
  private isLoading=false;
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
  getConfigSource(): Observable<ConfigEntity> {
    return this.load();
  }
  get(): Promise<ConfigEntity> {
    if (this.config.Status) {
      return Promise.resolve(this.config);
    }
    return new Promise((resolve, reject) => {
      const subscription = this.load()
        .pipe(
          finalize(() => {
            setTimeout(() => {
              if (subscription) {
                subscription.unsubscribe();
              }
            }, 3000);
          })
        )
        .subscribe(
          router => {
            resolve(router);
          },
          error => {
            reject(error);
            if(subscription){
              subscription.unsubscribe();
            }
          },
          () => {}
        );
    });
  }
  private load() {
    if (this.config.Status) {
      return of(this.config);
    }
    if(this.isLoading){
      return throwError(null);
    }
    const data = { domain: AppHelper.getDomain() };
    this.isLoading=true;
    return this.apiService
      .send<{
        DefaultImageUrl?: string;
        FaviconImageUrl?: string;
        PrerenderImageUrl?: string;
        LogoImageUrl?: string;
        Icp?: string;
        Style?: string;
      }>("ApiHomeUrl-Router-Get", data)
      .pipe(
        finalize(()=>{
          this.isLoading=false;
        }),
        map(r => {
          if (r.Data) {
            this.config.Status = true;
            this.config.DefaultImageUrl = r.Data.DefaultImageUrl;
            this.config.FaviconImageUrl = r.Data.FaviconImageUrl;
            this.config.PrerenderImageUrl = r.Data.PrerenderImageUrl;
            this.config.LogoImageUrl = r.Data.LogoImageUrl;
            this.config.Icp = r.Data.Icp;
            this.config.Style = r.Data.Style;
          }
          return this.config;
        })
      );
  }
}
