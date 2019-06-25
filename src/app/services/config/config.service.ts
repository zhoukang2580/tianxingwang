import { ConfigEntity } from "./config.entity";
import { RequestEntity } from "../api/Request.entity";
import { ApiService } from "../api/api.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, from, of } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { switchMap, tap, map, finalize } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private config: ConfigEntity;

  constructor(private apiService: ApiService) {
    this.config = new ConfigEntity();
    this.config.Status = false;
    setTimeout(() => {
      this.get()
        .then(_ => {
          console.log("get ConfigService complete");
        })
        .catch(e => {
          console.log("ConfigService get error", e);
        });
    }, 0);
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
            subscription.unsubscribe();
          },
          () => {}
        );
    });
  }
  private load() {
    if (this.config.Status) {
      return of(this.config);
    }
    const data = { domain: AppHelper.getDomain() };
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
